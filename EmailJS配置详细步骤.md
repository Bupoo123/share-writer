# EmailJS 配置详细步骤

## 📧 目标邮箱
**bupoo.7c04633@m.yinxiang.com**

## 🔧 完整配置流程

### 第一步：注册 EmailJS 账号

1. 访问 https://www.emailjs.com/
2. 点击右上角 "Sign Up" 注册账号
3. 可以使用 Google 账号快速注册，或使用邮箱注册
4. 注册完成后登录进入 Dashboard

### 第二步：添加邮件服务（Service）

1. 在 Dashboard 左侧菜单点击 **"Email Services"**
2. 点击 **"Add New Service"** 按钮
3. 选择邮件服务提供商：
   - **Gmail**（推荐，如果使用Gmail）
   - **Outlook**（如果使用Outlook）
   - **Custom SMTP Server**（如果使用其他邮箱服务）
   
4. 以 Gmail 为例：
   - 点击 "Gmail"
   - 点击 "Connect Account"
   - 授权 EmailJS 访问您的 Gmail 账号
   - 完成后会显示 **Service ID**（格式：`service_xxxxx`）
   - **重要**：复制并保存这个 Service ID

### 第三步：创建邮件模板（Template）

1. 在 Dashboard 左侧菜单点击 **"Email Templates"**
2. 点击 **"Create New Template"** 按钮
3. 填写模板信息：
   - **Template Name**: `share_writer_template`（可自定义）
   - **Subject**: `{{subject}}`（邮件主题）
   - **Content**: 复制下面的模板内容

#### 邮件模板内容（复制以下内容）：

```
收件人：{{to_email}}

主题：{{subject}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
文档信息
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
标题：{{document_title}}
作者：{{document_author}}
日期：{{document_date}}
字数：{{word_count}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Markdown 内容
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{{message}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
由 Share Writer 自动生成
```

4. 在模板设置中：
   - **To Email**: 填写 `bupoo.7c04633@m.yinxiang.com`（固定收件人）
   - 或者使用变量 `{{to_email}}`（代码中会自动填入）

5. 点击 **"Save"** 保存模板
6. **重要**：复制并保存 **Template ID**（格式：`template_xxxxx`）

### 第四步：获取 Public Key

1. 在 Dashboard 左侧菜单点击 **"Account"**
2. 在 **"General"** 标签页中找到 **"Public Key"**
3. **重要**：复制并保存这个 Public Key（格式：`xxxxxxxxxxxxx`）

### 第五步：在代码中配置

1. 打开项目文件：`js/script.js`
2. 找到以下代码（大约在第2-6行）：

```javascript
const EMAILJS_CONFIG = {
    serviceId: 'YOUR_SERVICE_ID',      // 需要在EmailJS网站获取
    templateId: 'YOUR_TEMPLATE_ID',    // 需要在EmailJS网站创建模板
    publicKey: 'YOUR_PUBLIC_KEY'       // 需要在EmailJS网站获取
};
```

3. 将三个值替换为您刚才获取的实际值：

```javascript
const EMAILJS_CONFIG = {
    serviceId: 'service_xxxxxxxxx',      // 替换为您的 Service ID
    templateId: 'template_xxxxxxxxx',    // 替换为您的 Template ID
    publicKey: 'xxxxxxxxxxxxxxxxxx'      // 替换为您的 Public Key
};
```

### 第六步：测试配置

1. 保存 `js/script.js` 文件
2. 刷新网页
3. 在 Share Writer 中输入一些测试内容
4. 点击 "📧 发送到邮箱" 按钮
5. 如果配置正确，会显示 "✅ 邮件已成功发送到 bupoo.7c04633@m.yinxiang.com"
6. 检查邮箱是否收到邮件

## ⚠️ 常见问题

### 问题1：找不到 Service ID
- **解决**：在 Email Services 页面，点击您创建的服务，Service ID 会显示在服务详情中

### 问题2：模板变量不匹配
- **解决**：确保模板中使用的变量名称与代码中的 `templateParams` 完全一致：
  - `{{to_email}}`
  - `{{subject}}`
  - `{{message}}`
  - `{{document_title}}`
  - `{{document_author}}`
  - `{{document_date}}`
  - `{{word_count}}`

### 问题3：邮件发送失败
- **检查**：
  1. Service ID、Template ID、Public Key 是否正确
  2. 邮件服务是否已正确连接（Gmail需要授权）
  3. 是否超过免费版限制（每月200封）
  4. 浏览器控制台是否有错误信息

### 问题4：收不到邮件
- **检查**：
  1. 检查垃圾邮件文件夹
  2. 确认目标邮箱地址正确：`bupoo.7c04633@m.yinxiang.com`
  3. 检查邮件服务提供商的发送限制

## 📝 配置检查清单

- [ ] 已注册 EmailJS 账号
- [ ] 已创建邮件服务（Service）并获取 Service ID
- [ ] 已创建邮件模板（Template）并获取 Template ID
- [ ] 已获取 Public Key
- [ ] 已在代码中替换三个配置值
- [ ] 已测试发送功能

## 🔒 安全提示

- **不要**将包含真实密钥的代码提交到公开的GitHub仓库
- 如果代码需要公开，建议使用环境变量或配置文件
- EmailJS的Public Key是公开的，但Service ID和Template ID建议保密

## 📞 需要帮助？

如果遇到问题：
1. 查看 EmailJS 官方文档：https://www.emailjs.com/docs/
2. 检查浏览器控制台的错误信息
3. 确认所有配置步骤都已正确完成

