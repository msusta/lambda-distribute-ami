{
  "Comment": "Distribute AMI",
  "StartAt": "ParseExec",
  "States": {
    "ParseExec": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:REGION:ACCOUNT_ID:function:SubmitJob",
      "ResultPath": "$.request",
      "Next": "CopyWait"
    },
    "CopyWait": {
      "Type": "Wait",
      "Seconds": 60,
      "Next": "GetAmiCopiesStatus"
    },
    "GetAmiCopiesStatus": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:REGION:ACCOUNT_ID:function:CheckJob",
      "Next": "CheckAmiCopiesStatus",
      "InputPath": "$.guid",
      "ResultPath": "$.status"
    },
    "CheckAmiCopiesStatus": {
      "Type": "Choice",
      "Choices": [
        {
          "Variable": "$.status",
          "StringEquals": "amicopyfailure",
          "Next": "AmiCopyFailure"
        },
        {
          "Variable": "$.status",
          "StringEquals": "waiting",
          "Next": "CopyWait"
        },
        {
          "Variable": "$.status",
          "StringEquals": "success",
          "Next": "TagAndShare"
        }
      ],
      "Default": "GeneralFailure"
    },
    "TagAndShare": {
      "Type": "Parallel",
      "Branches": [
        {
          "StartAt": "Tag",
          "States": {
            "Tag": {
              "Type": "Task",
              "Resource": "arn:aws:lambda:us-east-1:123456789012:function:tagger",
              "End": true
            }
          }
        },
        {
          "StartAt": "Share",
          "States": {
            "Share": {
              "Type": "Task",
              "Resource": "arn:aws:lambda:us-east-1:123456789012:function:share",
              "End": true
            }
          }
        }
      ],
      "Next": "Finish"
    },
    "AmiCopyFailure": {
      "Type": "Fail",
      "Cause": "AMI copies not available",
      "Error": "AmiCopyFailure"
    },
    "GeneralFailure": {
      "Type": "Fail",
      "Cause": "General Distribute AMI failure",
      "Error": "GeneralFailure"
    },
    "Finish": {
      "Type": "Pass",
      "End": true
    }
  }
}
