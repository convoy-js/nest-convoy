import {
  GroupMember,
  AssignerProtocol,
  MemberMetadata,
  GroupState,
  GroupMemberAssignment,
  PartitionAssigner,
} from 'kafkajs';

import { Kafka } from './kafka';

interface Group {
  members: GroupMember[];
  topics: string[];
}

interface TopicPartition {
  topic: string;
  partitionId: number;
}

interface Subscription {
  topics: string[];
  userData: Buffer;
}

export class KafkaReplyPartitionAssigner {
  readonly name = 'ConvoyReplyPartitionAssigner';
  readonly version = 1;

  constructor(
    private readonly kafka: Kafka,
    private readonly config: Parameters<PartitionAssigner>[0],
  ) {}

  public async assign(group: Group): Promise<GroupMemberAssignment[]> {
    const assignment: any = {};
    const previousAssignment: any = {};
    // const assignment: Record<string, Record<string, string[]>> = {};
    // const previousAssignment: Record<string, Record<string, string[]>> = {};

    const membersCount = group.members.length;
    const decodedMembers = group.members.map(member =>
      this.decodeMember(member),
    );
    const sortedMemberIds = decodedMembers
      .map(member => member.memberId)
      .sort();

    // build the previous assignment and an inverse map of topic > partition > memberId for lookup
    decodedMembers.forEach(member => {
      if (
        !previousAssignment[member.memberId] &&
        Object.keys(member.previousAssignment).length > 0
      ) {
        previousAssignment[member.memberId] = member.previousAssignment;
      }
    });

    // build a collection of topics and partitions
    const topicsPartitions = group.topics
      .map((topic: string): TopicPartition[] => {
        const partitionMetadata = this.config.cluster.findTopicPartitionMetadata(
          topic,
        );
        return partitionMetadata.map(m => ({
          topic,
          partitionId: m.partitionId,
        }));
      })
      .reduce((acc, val) => acc.concat(val), [] as TopicPartition[]);

    // create the new assignment by populating the members with the first partition of the topics
    sortedMemberIds.forEach(assignee => {
      if (!assignment[assignee]) {
        assignment[assignee] = {};
      }

      // add topics to each member
      group.topics.forEach(topic => {
        if (!assignment[assignee][topic]) {
          assignment[assignee][topic] = [];
        }

        // see if the topic and partition belong to a previous assignment
        if (
          previousAssignment[assignee] &&
          previousAssignment[assignee][topic] != null
        ) {
          // take the minimum partition since replies will be sent to the minimum partition
          const firstPartition = previousAssignment[assignee][topic];

          // create the assignment with the first partition
          assignment[assignee][topic].push(firstPartition);

          // find and remove this topic and partition from the topicPartitions to be assigned later
          const topicsPartitionsIndex = topicsPartitions.findIndex(
            topicPartition => {
              return (
                topicPartition.topic === topic &&
                topicPartition.partitionId === firstPartition
              );
            },
          );

          // only continue if we found a partition matching this topic
          if (topicsPartitionsIndex !== -1) {
            // remove inline
            topicsPartitions.splice(topicsPartitionsIndex, 1);
          }
        }
      });
    });

    // check for member topics that have a partition length of 0
    sortedMemberIds.forEach(assignee => {
      group.topics.forEach(topic => {
        // only continue if there are no partitions for assignee's topic
        if (assignment[assignee][topic].length === 0) {
          // find the first partition for this topic
          const topicsPartitionsIndex = topicsPartitions.findIndex(
            topicPartition => {
              return topicPartition.topic === topic;
            },
          );

          if (topicsPartitionsIndex !== -1) {
            // find and set the topic partition
            const partition =
              topicsPartitions[topicsPartitionsIndex].partitionId;

            assignment[assignee][topic].push(partition);

            // remove this partition from the topics partitions collection
            topicsPartitions.splice(topicsPartitionsIndex, 1);
          }
        }
      });
    });

    // then balance out the rest of the topic partitions across the members
    const insertAssignmentsByTopic = (
      topicPartition: TopicPartition,
      i: number,
    ) => {
      const assignee = sortedMemberIds[i % membersCount];

      assignment[assignee][topicPartition.topic].push(
        topicPartition.partitionId,
      );
    };

    // build the assignments
    topicsPartitions.forEach(insertAssignmentsByTopic);

    // encode the end result
    return Object.keys(assignment).map(memberId => ({
      memberId,
      // @ts-ignore
      memberAssignment: AssignerProtocol.MemberAssignment.encode({
        version: this.version,
        assignment: assignment[memberId],
      }),
    }));
  }

  public protocol(subscription: Subscription): GroupState {
    const stringifiedUserData = JSON.stringify({
      previousAssignment: this.kafka.getPreviousAssignments(),
    });
    subscription.userData = Buffer.from(stringifiedUserData);

    return {
      name: this.name,
      metadata: AssignerProtocol.MemberMetadata.encode({
        version: this.version,
        topics: subscription.topics,
        userData: subscription.userData,
      }),
    };
  }

  public decodeMember(member: GroupMember) {
    const memberMetadata = AssignerProtocol.MemberMetadata.decode(
      member.memberMetadata,
    ) as MemberMetadata;
    const memberUserData = JSON.parse(memberMetadata.userData.toString());

    return {
      memberId: member.memberId,
      previousAssignment: memberUserData.previousAssignment,
    };
  }
}
