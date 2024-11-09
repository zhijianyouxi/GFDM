/* 设备温度参数 */
message DeviceTempCtlInfo {
    string id = 1; // 温控器名称
    float preheatTemp = 2; // 预热温度
	float printTemp = 3; // 打印温度
	float coolTemp = 4; // 冷却温度
	float givenTemp = 5; // 给定温度
}

/* 设备 */
message DeviceLaserCtlInfo {
    string id = 1; // 默认 填充 轮廓 二次轮廓
    int32 pwr = 2; // 功率
	int32 markSpeed = 3; // 扫描速度
	int32 jumpSpeed = 4; // 跳转速度
	int32 markDelay = 5; // 打标延时
	int32 jumpDelay = 6; // 跳转延时
	int32 inflectionDelay = 7; // 拐点延时;
	int32 laserOnDelay = 8; // 开激光延时
	int32 laserOffDelay = 9; // 关激光延时
	int32 inflectionSupTime = 10; // 拐点抑制时间
	int32 zOffset = 11; // z偏移
}

/* fastapi: 查询设备参数信息的响应 */
message ApiDevicesParaRes {
    string error = 1; // 错误描述
    repeated DeviceStateInfo deviceStateInfo = 2; // 设备状态信息
}

/* fastapi: 查询某设备状态信息的响应 */
message ApiDevicesStateInfoRes {
    string error = 1; // 错误描述
    repeated DeviceTempCtlInfo deviceTempCtlInfo = 2; // 温度信息
	repeated DeviceLaserCtlInfo dDeviceLaserCtlInfo = 3; // 激光信息
	repeated float rgTemp = 4; // 温度
	repeated float ptTemp = 5; // 温度
	repeated float cxqTemp = 6; // 温度
	repeated float cxhTemp = 7; // 温度
	repeated float cxzTemp = 8; // 温度
	repeated float cxyTemp = 9; // 温度
}

/* fastapi: 查询某设备状态信息的 */
message ApiDevicesStateInfoReq {
    string cmd = 1; // temp查询温度设定值，laser查询激光参数
}