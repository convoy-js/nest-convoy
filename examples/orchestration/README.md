```
action: function(ctx) {
    workflow.check(!ctx.issue.isChanged('votes'), workflow.i18n('Voting for a resolved issue is not allowed.'));
},
```
