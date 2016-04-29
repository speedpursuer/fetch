<?php

// Set content-type
header('content-type: application/json; charset=utf-8');

$title = $_POST['title'];
$msg = $_POST['message'];
$push_id = $_POST['push_id'];


require_once 'sdk.php';

// 创建SDK对象.
$sdk = new PushSDK();

$channelId = '5490126185581469391';

// message content.
$message = array (
		'aps' => array (
				// 消息内容
				'alert' => $msg,
				'sound' => 'sound.m4r'
		),
		'push_id' => $push_id,
		'header' => $title
);

// 设置消息类型为 通知类型.
$opts = array (
		'msg_type' => 1,        // iOS不支持透传, 只能设置 msg_type:1, 即通知消息.
		'deploy_status' => 2,   // iOS应用的部署状态:  1：开发状态；2：生产状态； 若不指定，则默认设置为生产状态。
);

// 向目标设备发送一条消息
// $rs = $sdk -> pushMsgToSingleDevice($channelId, $message, $opts);
$rs = $sdk -> pushMsgToAll($message, $opts);

// 判断返回值,当发送失败时, $rs的结果为false, 可以通过getError来获得错误信息.
if($rs === false){ 	
	echo json_encode(array(
			'errCode' => $sdk->getLastErrorCode(), 
			'errMsg' => $sdk->getLastErrorMsg()
		 ));
}else{
	echo json_encode(array('success' => true));
}