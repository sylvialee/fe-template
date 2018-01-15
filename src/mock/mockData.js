// 检查站模拟数据
yod.type('User', {
  id: '@Id',
  name: '@ChineseName',
  age: '@Age(adult)',
  avatar: '@Avatar',
  gender: '@gender',
  isDanger: '@Bool(0.1)',
  dangerReason: '无',
  XRayPic: "images/X-ray.png",
  mmRayPic: "images/mm-ray.png",
  checkStation: '一号车站',
});
// 重复生成 2 - 4 个用户
console.log(yod('@User.repeat(15, 30)'));
