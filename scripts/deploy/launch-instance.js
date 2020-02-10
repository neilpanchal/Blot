var AWS = require("aws-sdk");
var accessKeyId = process.env.AWS_DEPLOYMENT_ACCESS_KEY_ID;
var secretAccessKey = process.env.AWS_DEPLOYMENT_SECRET_ACCESS_KEY;

AWS.config.update({
	accessKeyId,
	secretAccessKey
});

var ec2 = new AWS.EC2({ region: process.env.AWS_REGION });

var ImageId = process.env.AWS_IMAGE_ID;
var InstanceType = process.env.AWS_INSTANCE_TYPE;

const SecurityGroupIds = [process.env.AWS_SECURITY_GROUP_ID];
const KeyName = process.env.AWS_KEY_NAME;
const SubnetId = process.env.AWS_SUBNET_ID;
const UserData = require("fs").readFileSync(
	__dirname + "/out/user-data.sh",
	"base64"
);

// You need
// ec2.describeKeyPairs({}, function(err, { KeyPairs }) {
// 	const KeyName = KeyPairs.filter(({ KeyName }) => {
// 		console.log(KeyName, keyPairName);
// 		return KeyName === keyPairName;
// 	}).KeyName;

// 	console.log(KeyName);
// });

// ec2.describeSecurityGroups({}, function(err, { SecurityGroups }) {
// 	const SecurityGroupId = SecurityGroups.filter(({ GroupName }) => {
// 		console.log(GroupName, securityGroupName);
// 		return GroupName === securityGroupName;
// 	})[0].GroupId;

// 	console.log(SecurityGroupId);
// });

// ec2.describeSubnets(params, function(err, data) {
//    if (err) console.log(err, err.stack); // an error occurred
//    else     console.log(data);           // successful response
//  });

var params = {
	ImageId,
	InstanceType,
	KeyName,
	MaxCount: 1,
	MinCount: 1,
	SecurityGroupIds,
	SubnetId,
	UserData
};

ec2.runInstances(params, function(err, data) {
	if (err) console.log(err, err.stack);
	// an error occurred
	else console.log(data); // successful response
	const InstanceId = data.Instances[0].InstanceId;
	console.log('Waiting until instance is running', InstanceId);
	ec2.waitFor("instanceRunning", { InstanceIds: [InstanceId] }, function(
		err,
		data
	) {
		if (err) console.log(err, err.stack);
		// an error occurred
		else console.log(data); // successful response
		const instance = data.Reservations[0].Instances[0];

		console.log('Instance running, connect with:');
		console.log(`ssh -o "StrictHostKeyChecking no" -i blot-deployment.pem ec2-user@${instance.PublicIpAddress}`);
		console.log('Once connected, check on init script:');
		console.log('tail -f /var/log/cloud-init-output.log')
	});
});
