FROM ubuntu

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /yb-kafka
RUN apt update && apt install -y wget git default-jdk maven
RUN wget http://apache.cs.utah.edu/kafka/2.5.0/kafka_2.12-2.5.0.tgz
RUN tar -xzf kafka_2.12-2.5.0.tgz
RUN git clone https://github.com/marcus-sa/yb-kafka-connector.git

COPY kafka.connect.properties yb-kafka-connector
COPY yugabyte.sink.properties yb-kafka-connector

WORKDIR /yb-kafka/yb-kafka-connector
RUN mvn clean install -DskipTests -e \
  && cp target/yb-kafka-connector-1.0.0.jar /yb-kafka/kafka_2.12-2.5.0/libs/

WORKDIR /yb-kafka/kafka_2.12-2.5.0/libs/
RUN wget https://repo1.maven.org/maven2/com/google/guava/failureaccess/1.0.1/failureaccess-1.0.1.jar
RUN wget https://repo1.maven.org/maven2/com/google/guava/guava/30.1-jre/guava-30.1-jre.jar
RUN wget https://repo1.maven.org/maven2/io/netty/netty-all/4.1.51.Final/netty-all-4.1.51.Final.jar
RUN wget https://repo1.maven.org/maven2/com/yugabyte/cassandra-driver-core/3.8.0-yb-5/cassandra-driver-core-3.8.0-yb-5.jar
RUN wget https://repo1.maven.org/maven2/com/codahale/metrics/metrics-core/3.0.1/metrics-core-3.0.1.jar

CMD ["/yb-kafka/kafka_2.12-2.5.0/bin/connect-standalone.sh", "/yb-kafka/yb-kafka-connector/kafka.connect.properties", "/yb-kafka/yb-kafka-connector/yugabyte.sink.properties"]


