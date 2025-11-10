// EmailJS配置 - 需要替换为您的实际配置
const EMAILJS_CONFIG = {
    serviceId: 'YOUR_SERVICE_ID',      // 需要在EmailJS网站获取
    templateId: 'YOUR_TEMPLATE_ID',    // 需要在EmailJS网站创建模板
    publicKey: 'YOUR_PUBLIC_KEY'       // 需要在EmailJS网站获取
};

// 目标邮箱
const TARGET_EMAIL = 'bupoo.7c04633@m.yinxiang.com';

// 初始化EmailJS
if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_CONFIG.publicKey);
}

// 获取Markdown原始内容
function getMarkdownContent() {
    return document.getElementById('src').value.trim();
}

// 发送邮件功能
async function sendEmail() {
    const markdownContent = getMarkdownContent();
    
    if (!markdownContent) {
        alert('请先输入内容后再发送邮件');
        return;
    }
    
    // 检查EmailJS配置
    if (EMAILJS_CONFIG.serviceId === 'YOUR_SERVICE_ID' || 
        EMAILJS_CONFIG.templateId === 'YOUR_TEMPLATE_ID' ||
        EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
        alert('请先在代码中配置EmailJS参数（serviceId, templateId, publicKey）\n\n详细配置说明请查看：EMAILJS配置说明.md');
        return;
    }
    
    // 检查EmailJS是否加载
    if (typeof emailjs === 'undefined') {
        alert('EmailJS库加载失败，请检查网络连接');
        return;
    }
    
    // 获取文档信息
    const title = document.getElementById('docTitle').value.trim() || '未命名文档';
    const author = document.getElementById('docAuthor').value.trim() || '';
    const currentDate = new Date().toLocaleDateString('zh-CN');
    
    // 显示发送中提示
    const btn = document.getElementById('btnSendEmail');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '📧 发送中...';
    
    try {
        // 准备邮件参数
        const templateParams = {
            to_email: TARGET_EMAIL,
            subject: `${title} - ${currentDate}`,
            message: markdownContent, // Markdown格式内容
            document_title: title,
            document_author: author || '未填写',
            document_date: currentDate,
            word_count: markdownContent.length.toString()
        };
        
        // 发送邮件
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );
        
        console.log('邮件发送成功:', response);
        alert(`✅ 邮件已成功发送到 ${TARGET_EMAIL}\n\n文档标题：${title}\n发送时间：${currentDate}`);
        
    } catch (error) {
        console.error('邮件发送错误:', error);
        let errorMsg = '邮件发送失败';
        
        if (error.text) {
            errorMsg += `: ${error.text}`;
        } else if (error.message) {
            errorMsg += `: ${error.message}`;
        }
        
        const fullErrorMsg = `邮件发送失败！

可能的原因：
1. EmailJS配置不正确（serviceId, templateId, publicKey）
2. 邮件模板中的变量名称不匹配
3. 网络连接问题
4. EmailJS服务限制（免费版每月200封）

错误详情：${error.text || error.message || '未知错误'}

请检查配置后重试。`;
        alert(fullErrorMsg);
    } finally {
        // 恢复按钮状态
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

// 简单：把 Markdown 转为 HTML；并生成目录
function buildTOC(container){
  const hs = container.querySelectorAll('h1,h2,h3');
  if(!hs.length) return null;
  const toc = document.createElement('div');
  toc.className='toc';
  toc.innerHTML = '<strong>目录</strong>';
  const ul = document.createElement('ul');
  ul.style.margin='8px 0'; ul.style.paddingLeft='1.1em';
  hs.forEach((h,i)=>{
    if(!h.id) h.id = 'h-' + (i+1);
    const li = document.createElement('li');
    li.style.margin='4px 0';
    li.style.listStyle = 'disc';
    const a = document.createElement('a');
    a.textContent = h.textContent.trim();
    a.href = '#'+h.id;
    a.style.textDecoration='none';
    a.style.color='#334155';
    if(h.tagName==='H2') a.style.fontWeight='600';
    if(h.tagName==='H3') a.style.marginLeft='8px';
    li.appendChild(a);
    ul.appendChild(li);
  });
  toc.appendChild(ul);
  return toc;
}

function render(){
  const src = document.getElementById('src').value.trim();
  const container = document.getElementById('preview');
  container.className = 'doc'; // reset classes
  // 主题与宽度
  const theme = document.getElementById('theme').value;
  if(theme==='serif') container.classList.add('serif');
  const widthClass = document.getElementById('width').value;
  if(widthClass) container.classList.add(widthClass);
  // 字体选择
  const fontFamily = document.getElementById('fontFamily').value;
  if(fontFamily && fontFamily !== 'default') container.classList.add('font-' + fontFamily);

  // 自动识别并提取标题
  const detectedTitle = extractTitleFromMarkdown(src);
  if (detectedTitle) {
    // 自动填写到文档标题输入框
    document.getElementById('docTitle').value = detectedTitle;
    // 从内容中移除大标题
    const contentWithoutTitle = removeTitleFromContent(src);
    // 更新文本区域内容
    document.getElementById('src').value = contentWithoutTitle;
  }

  // 使用处理后的内容（移除标题后的内容）
  const processedSrc = document.getElementById('src').value.trim();
  
  // 解析 Markdown
  const html = marked.parse(processedSrc || '（在左侧粘贴内容，点击"生成预览"查看效果）');

  // 封面 & 目录
  const fm = document.getElementById('frontmatter').value;
  const title = document.getElementById('docTitle').value.trim() || '未命名分析';
  const author = document.getElementById('docAuthor').value.trim() || '';
  const now = new Date();
  const dateStr = now.toLocaleDateString();

  // 构造文档
  const frag = document.createElement('div');

  // 封面
  if(fm==='cover' || fm==='cover_toc'){
    const cover = document.createElement('div');
    cover.className='cover';
    cover.innerHTML = `
      <h1>${escapeHtml(title)}</h1>
      <div class="sub">${author?escapeHtml(author)+' · ':''}${dateStr}</div>
    `;
    frag.appendChild(cover);
  }

  // 目录
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  if(fm==='toc' || fm==='cover_toc'){
    const toc = buildTOC(tmp);
    if(toc) frag.appendChild(toc);
  }

  // 正文
  frag.appendChild(tmp);
  container.innerHTML = '';
  container.appendChild(frag);
  
  // 更新统计信息
  updateStats();
}

// 自动识别并提取Markdown大标题
function extractTitleFromMarkdown(content) {
  if (!content) return null;
  
  // 查找第一个一级标题 (# 标题)
  const lines = content.split('\n');
  for (let line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('# ') && trimmedLine.length > 2) {
      // 提取标题文本，去掉 # 和前后空格
      return trimmedLine.substring(2).trim();
    }
  }
  return null;
}

// 从内容中移除大标题
function removeTitleFromContent(content) {
  if (!content) return content;
  
  const lines = content.split('\n');
  const result = [];
  let titleRemoved = false;
  
  for (let line of lines) {
    const trimmedLine = line.trim();
    // 如果是第一个一级标题且还没有移除过标题，则跳过这一行
    if (!titleRemoved && trimmedLine.startsWith('# ') && trimmedLine.length > 2) {
      titleRemoved = true;
      continue; // 跳过这个标题行
    }
    result.push(line);
  }
  
  return result.join('\n');
}

// 更新字数统计和页数统计
function updateStats(){
  const src = document.getElementById('src').value.trim();
  const wordCount = src.length;
  document.getElementById('wordCount').textContent = `字数: ${wordCount}`;
  
  // 估算页数（基于A4纸张，每页约500字）
  const estimatedPages = Math.ceil(wordCount / 500);
  document.getElementById('pageCount').textContent = `页数: ${estimatedPages}`;
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m]));
}

// 导出完整 HTML（带内联样式，所见即所得）
function exportHTML(){
  render(); // 确保是最新预览
  const title = document.getElementById('docTitle').value.trim() || '未命名分析';
  const doc = document.getElementById('preview').cloneNode(true);
  
  // 获取所有样式表的内容
  let css = '';
  const styleSheets = document.styleSheets;
  for (let i = 0; i < styleSheets.length; i++) {
    try {
      const rules = styleSheets[i].cssRules || styleSheets[i].rules;
      if (rules) {
        for (let j = 0; j < rules.length; j++) {
          css += rules[j].cssText + '\n';
        }
      }
    } catch (e) {
      // 跨域样式表可能无法访问，跳过
      console.warn('无法访问样式表:', e);
    }
  }
  
  // 如果没有获取到样式，使用内联样式
  if (!css) {
    css = `
      :root{--bg:#f7f8fa;--card:#fff;--text:#222;--muted:#666;--accent:#3b82f6;--code:#0f172a;--code-bg:#f1f5f9;--serif:"Noto Serif SC","Source Serif 4",serif;--sans:"Inter","Noto Sans SC","Microsoft YaHei",system-ui,-apple-system,sans-serif;--font-default:"Inter","Noto Sans SC","Microsoft YaHei",system-ui,-apple-system,sans-serif;--font-microsoft-yahei:"Microsoft YaHei","微软雅黑",sans-serif;--font-simsun:"SimSun","宋体",serif;--font-kaiti:"KaiTi","楷体",serif;--font-heiti:"SimHei","黑体",sans-serif;--font-fangsong:"FangSong","仿宋",serif;}
      *{box-sizing:border-box}
      body{background:var(--bg);margin:0;font-family:var(--sans);color:var(--text)}
      .doc{--doc-width:840px;--doc-padding:48px;--doc-font:var(--sans);max-width:var(--doc-width);margin:24px auto;padding:var(--doc-padding);border-radius:18px;border:1px solid #eef2f7;background:#fff;font-family:var(--doc-font);line-height:1.75}
      .doc.serif{--doc-font:var(--serif)}
      .doc.narrow{--doc-width:720px}
      .doc.wide{--doc-width:980px}
      .doc *{scroll-margin-top:90px}
      .doc h1,.doc h2,.doc h3{line-height:1.3}
      .doc h1{font-size:32px;margin:0 0 8px}
      .doc h2{font-size:24px;margin:24px 0 8px;border-left:4px solid var(--accent);padding-left:10px}
      .doc h3{font-size:18px;margin:18px 0 6px}
      .doc p{margin:.5em 0}
      .doc ul,.doc ol{padding-left:1.3em;margin:.5em 0}
      .doc blockquote{margin:12px 0;padding:10px 14px;border-left:4px solid #e5e7eb;background:#fafafa;border-radius:8px}
      .doc code{font-family:ui-monospace,Menlo,Consolas,monospace;background:var(--code-bg);color:var(--code);padding:2px 6px;border-radius:6px}
      .doc pre{background:var(--code-bg);padding:14px;border-radius:12px;overflow:auto}
      .toc{background:#fbfdff;border:1px solid #e5f0ff;padding:12px 14px;border-radius:12px;margin:12px 0}
      .cover{border-bottom:1px dashed #e5e7eb;margin-bottom:16px;padding-bottom:12px}
      .cover h1{margin-bottom:0}
      .cover .sub{color:#64748b}
      .footer{margin-top:28px;padding-top:10px;border-top:1px dashed #e5e7eb;color:#6b7280;font-size:12px}
      .doc.font-default{font-family:var(--font-default)}
      .doc.font-microsoft-yahei{font-family:var(--font-microsoft-yahei)}
      .doc.font-simsun{font-family:var(--font-simsun)}
      .doc.font-kaiti{font-family:var(--font-kaiti)}
      .doc.font-heiti{font-family:var(--font-heiti)}
      .doc.font-fangsong{font-family:var(--font-fangsong)}
    `;
  }
  
  const tpl = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${css}</style>
</head>
<body>
<div class="doc ${doc.className.replace('doc','').trim()}">${doc.innerHTML}</div>
<div class="footer">由 Share Writer 导出 · ${new Date().toLocaleString()}</div>
</body>
</html>`;
  const blob = new Blob([tpl],{type:"text/html;charset=utf-8"});
  saveAs(blob, safeFileName(title)+".html");
}

// 导出 Word（使用本地Word导出）
function exportDOCX(){
  exportLocalWord();
}

// 备用RTF导出函数
function exportRTF(){
  render();
  const title = document.getElementById('docTitle').value.trim() || '未命名分析';
  const doc = document.getElementById('preview').cloneNode(true);
  
  // 简单的RTF格式转换
  let rtf = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}{\\f1 Microsoft YaHei;}}';
  rtf += '\\f1\\fs24 '; // 设置中文字体和大小
  
  // 转换HTML为RTF
  const textContent = doc.textContent || doc.innerText || '';
  const rtfContent = textContent
    .replace(/\n/g, '\\par ')
    .replace(/\r/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}');
  
  rtf += rtfContent;
  rtf += '}';
  
  const blob = new Blob([rtf], { type: 'application/rtf' });
  saveAs(blob, safeFileName(title) + '.rtf');
  console.log('RTF文档导出成功');
}

// 简化的Word导出（不依赖外部库）
function exportSimpleWord(){
  render();
  const title = document.getElementById('docTitle').value.trim() || '未命名分析';
  const doc = document.getElementById('preview').cloneNode(true);
  
  // 生成简单的HTML，Word可以打开
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
body { font-family: "Microsoft YaHei", "SimSun", sans-serif; line-height: 1.6; margin: 40px; }
h1 { font-size: 24px; color: #333; margin-bottom: 20px; }
h2 { font-size: 18px; color: #666; margin-top: 30px; margin-bottom: 15px; }
h3 { font-size: 16px; color: #888; margin-top: 20px; margin-bottom: 10px; }
p { margin: 10px 0; }
ul, ol { margin: 10px 0; padding-left: 30px; }
blockquote { border-left: 4px solid #ddd; padding-left: 15px; margin: 15px 0; color: #666; }
code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
</style>
</head>
<body>
${doc.innerHTML}
</body>
</html>`;
  
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  saveAs(blob, safeFileName(title) + '.html');
  console.log('简化Word格式导出成功（HTML格式，可用Word打开）');
}

// 本地Word导出（完全本地化，不依赖任何外部库）
function exportLocalWord(){
  render();
  const title = document.getElementById('docTitle').value.trim() || '未命名分析';
  const doc = document.getElementById('preview').cloneNode(true);
  
  // 生成Word兼容的HTML格式
  const wordHtml = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<meta name="ProgId" content="Word.Document">
<meta name="Generator" content="Microsoft Word 15">
<meta name="Originator" content="Microsoft Word 15">
<title>${escapeHtml(title)}</title>
<!--[if gte mso 9]><xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>90</w:Zoom>
<w:DoNotOptimizeForBrowser/>
</w:WordDocument>
</xml><![endif]-->
<style>
@page {
  size: A4;
  margin: 2.54cm 2.54cm 2.54cm 2.54cm;
}
body {
  font-family: "Microsoft YaHei", "SimSun", "宋体", sans-serif;
  font-size: 12pt;
  line-height: 1.5;
  color: #000000;
  margin: 0;
  padding: 0;
}
h1 {
  font-size: 18pt;
  font-weight: bold;
  color: #000000;
  margin: 12pt 0 6pt 0;
  page-break-after: avoid;
}
h2 {
  font-size: 16pt;
  font-weight: bold;
  color: #000000;
  margin: 12pt 0 6pt 0;
  page-break-after: avoid;
}
h3 {
  font-size: 14pt;
  font-weight: bold;
  color: #000000;
  margin: 12pt 0 6pt 0;
  page-break-after: avoid;
}
p {
  margin: 0 0 6pt 0;
  text-align: justify;
}
ul, ol {
  margin: 6pt 0;
  padding-left: 36pt;
}
li {
  margin: 3pt 0;
}
blockquote {
  margin: 12pt 0;
  padding-left: 12pt;
  border-left: 3pt solid #CCCCCC;
  font-style: italic;
}
code {
  font-family: "Courier New", monospace;
  background-color: #F5F5F5;
  padding: 1pt 3pt;
}
.toc {
  border: 1pt solid #CCCCCC;
  padding: 12pt;
  margin: 12pt 0;
  background-color: #F9F9F9;
}
.cover {
  text-align: center;
  margin-bottom: 24pt;
}
.footer {
  margin-top: 24pt;
  padding-top: 6pt;
  border-top: 1pt solid #CCCCCC;
  font-size: 10pt;
  color: #666666;
}
</style>
</head>
<body>
${doc.innerHTML}
<div class="footer">由 Share Writer 生成 · ${new Date().toLocaleString()}</div>
</body>
</html>`;
  
  // 创建Word文档
  const blob = new Blob([wordHtml], { 
    type: 'application/msword;charset=utf-8' 
  });
  
  // 尝试使用不同的文件名扩展名
  const fileName = safeFileName(title);
  saveAs(blob, fileName + '.doc');
  
  console.log('本地Word导出成功');
  alert('✅ 本地Word导出成功！\n\n文件已保存为 .doc 格式\n可用Microsoft Word打开');
}

function safeFileName(name){
  return name.replace(/[\\/:*?"<>|]/g,'_').slice(0,60);
}

// 图片导出功能 - 使用html2canvas生成图片
function exportImage(){
  render(); // 确保是最新预览
  const title = document.getElementById('docTitle').value.trim() || '未命名分析';
  
  // 动态加载html2canvas库
  if (typeof html2canvas === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    script.onload = () => {
      generateImage();
    };
    document.head.appendChild(script);
  } else {
    generateImage();
  }
  
  function generateImage() {
    const previewElement = document.getElementById('preview');
    
    // 创建临时容器，优化图片质量
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: 800px;
      background: white;
      padding: 40px;
      font-family: var(--font-default);
    `;
    
    // 复制预览内容
    const clonedContent = previewElement.cloneNode(true);
    tempContainer.appendChild(clonedContent);
    document.body.appendChild(tempContainer);
    
    // 应用字体选择
    const fontFamily = document.getElementById('fontFamily').value;
    if(fontFamily && fontFamily !== 'default') {
      clonedContent.classList.add('font-' + fontFamily);
    }
    
    // 生成图片
    html2canvas(tempContainer, {
      backgroundColor: '#ffffff',
      scale: 2, // 提高清晰度
      useCORS: true,
      allowTaint: true,
      width: 800,
      height: tempContainer.scrollHeight
    }).then(canvas => {
      // 下载图片
      canvas.toBlob(function(blob) {
        saveAs(blob, safeFileName(title) + '.png');
      }, 'image/png');
      
      // 清理临时元素
      document.body.removeChild(tempContainer);
      
      console.log('图片导出成功');
      alert('✅ 图片导出成功！\n\n文件已保存为 PNG 格式\n可直接在微信中分享');
    }).catch(error => {
      console.error('图片导出失败:', error);
      alert('❌ 图片导出失败，请重试');
      document.body.removeChild(tempContainer);
    });
  }
}

// 微信优化HTML导出 - 简化版本，适合微信预览
function exportWechatHTML(){
  render(); // 确保是最新预览
  const title = document.getElementById('docTitle').value.trim() || '未命名分析';
  const doc = document.getElementById('preview').cloneNode(true);
  
  // 微信优化的简化样式
  const wechatCSS = `
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 100%;
        margin: 0;
        padding: 20px;
        background: #fff;
      }
      h1 {
        font-size: 24px;
        color: #1a1a1a;
        margin: 0 0 16px 0;
        font-weight: 700;
        border-bottom: 2px solid #3b82f6;
        padding-bottom: 8px;
      }
      h2 {
        font-size: 20px;
        color: #2d3748;
        margin: 24px 0 12px 0;
        font-weight: 600;
        border-left: 4px solid #3b82f6;
        padding-left: 12px;
      }
      h3 {
        font-size: 18px;
        color: #4a5568;
        margin: 20px 0 8px 0;
        font-weight: 600;
      }
      p {
        margin: 8px 0;
        text-align: justify;
      }
      ul, ol {
        padding-left: 20px;
        margin: 12px 0;
      }
      li {
        margin: 4px 0;
      }
      blockquote {
        margin: 16px 0;
        padding: 12px 16px;
        border-left: 4px solid #e5e7eb;
        background: #f8fafc;
        border-radius: 6px;
        color: #4a5568;
      }
      code {
        font-family: 'Courier New', monospace;
        background: #f1f5f9;
        color: #0f172a;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 14px;
      }
      pre {
        background: #f1f5f9;
        padding: 16px;
        border-radius: 8px;
        overflow-x: auto;
        border: 1px solid #e2e8f0;
      }
      .toc {
        background: #fbfdff;
        border: 1px solid #e5f0ff;
        padding: 16px;
        border-radius: 8px;
        margin: 16px 0;
      }
      .toc strong {
        color: #1e40af;
        font-size: 16px;
        display: block;
        margin-bottom: 8px;
      }
      .toc ul {
        margin: 8px 0;
        padding-left: 16px;
      }
      .toc a {
        color: #334155;
        text-decoration: none;
      }
      .cover {
        text-align: center;
        border-bottom: 2px solid #e5e7eb;
        margin-bottom: 24px;
        padding-bottom: 24px;
      }
      .cover h1 {
        margin-bottom: 8px;
        color: #1a1a1a;
        border: none;
        padding: 0;
      }
      .cover .sub {
        color: #64748b;
        font-size: 14px;
      }
      .footer {
        margin-top: 32px;
        padding-top: 16px;
        border-top: 1px dashed #e5e7eb;
        color: #6b7280;
        font-size: 12px;
        text-align: center;
      }
      @media (max-width: 600px) {
        body { padding: 15px; }
        h1 { font-size: 22px; }
        h2 { font-size: 18px; }
        h3 { font-size: 16px; }
      }
    </style>
  `;
  
  const wechatHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
${wechatCSS}
</head>
<body>
${doc.innerHTML}
<div class="footer">由 Share Writer 生成 · ${new Date().toLocaleString()}</div>
</body>
</html>`;
  
  const blob = new Blob([wechatHTML], { type: 'text/html;charset=utf-8' });
  saveAs(blob, safeFileName(title) + '_微信版.html');
  
  console.log('微信优化HTML导出成功');
  alert('✅ 微信优化HTML导出成功！\n\n文件已保存为 _微信版.html\n可在微信中预览和分享');
}

// 纯文本导出功能
function exportText(){
  render(); // 确保是最新预览
  const title = document.getElementById('docTitle').value.trim() || '未命名分析';
  const doc = document.getElementById('preview');
  
  // 获取纯文本内容
  const textContent = doc.textContent || doc.innerText || '';
  
  // 添加标题和分隔线
  const fullText = `${title}\n${'='.repeat(title.length)}\n\n${textContent}\n\n---\n由 Share Writer 生成 · ${new Date().toLocaleString()}`;
  
  const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, safeFileName(title) + '.txt');
  
  console.log('纯文本导出成功');
  alert('✅ 纯文本导出成功！\n\n文件已保存为 .txt 格式\n可直接复制内容到微信');
}

// PDF导出功能 - 使用浏览器打印功能
function exportPDF(){
  render(); // 确保是最新预览
  const title = document.getElementById('docTitle').value.trim() || '未命名分析';
  
  // 创建打印样式
  const printStyles = `
    <style>
      @media print {
        @page {
          margin: 2cm 2cm 2cm 2cm;
          @top-center { content: ""; }
          @bottom-center { content: counter(page); }
          @bottom-left { content: ""; }
          @bottom-right { content: ""; }
        }
        body * {
          visibility: hidden;
        }
        .print-content, .print-content * {
          visibility: visible;
        }
        .print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .doc {
          border: none !important;
          box-shadow: none !important;
          margin: 0 auto !important;
          padding: 40px !important;
          max-width: 800px !important;
          font-family: var(--font-default) !important;
          line-height: 1.75 !important;
          color: #222 !important;
          background: white !important;
        }
        .doc.font-microsoft-yahei { font-family: "Microsoft YaHei", "微软雅黑", sans-serif !important; }
        .doc.font-simsun { font-family: "SimSun", "宋体", serif !important; }
        .doc.font-kaiti { font-family: "KaiTi", "楷体", serif !important; }
        .doc.font-heiti { font-family: "SimHei", "黑体", sans-serif !important; }
        .doc.font-fangsong { font-family: "FangSong", "仿宋", serif !important; }
        .doc h1 {
          font-size: 28px !important;
          margin: 0 0 16px 0 !important;
          color: #1a1a1a !important;
          font-weight: 700 !important;
        }
        .doc h2 {
          font-size: 22px !important;
          margin: 32px 0 12px 0 !important;
          color: #2d3748 !important;
          font-weight: 600 !important;
          border-left: 4px solid #3b82f6 !important;
          padding-left: 12px !important;
        }
        .doc h3 {
          font-size: 18px !important;
          margin: 24px 0 8px 0 !important;
          color: #4a5568 !important;
          font-weight: 600 !important;
        }
        .doc p {
          margin: 8px 0 !important;
          text-align: justify !important;
        }
        .doc ul, .doc ol {
          padding-left: 24px !important;
          margin: 12px 0 !important;
        }
        .doc li {
          margin: 4px 0 !important;
        }
        .doc blockquote {
          margin: 16px 0 !important;
          padding: 12px 16px !important;
          border-left: 4px solid #e5e7eb !important;
          background: #f8fafc !important;
          border-radius: 8px !important;
          color: #4a5568 !important;
        }
        .doc code {
          font-family: 'Courier New', monospace !important;
          background: #f1f5f9 !important;
          color: #0f172a !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          font-size: 14px !important;
        }
        .doc pre {
          background: #f1f5f9 !important;
          padding: 16px !important;
          border-radius: 8px !important;
          overflow: visible !important;
          border: 1px solid #e2e8f0 !important;
        }
        .toc {
          background: #fbfdff !important;
          border: 1px solid #e5f0ff !important;
          padding: 16px !important;
          border-radius: 8px !important;
          margin: 16px 0 !important;
        }
        .toc strong {
          color: #1e40af !important;
          font-size: 16px !important;
        }
        .toc ul {
          margin: 8px 0 !important;
          padding-left: 16px !important;
        }
        .toc a {
          color: #334155 !important;
          text-decoration: none !important;
        }
        .cover {
          text-align: center !important;
          border-bottom: 2px solid #e5e7eb !important;
          margin-bottom: 24px !important;
          padding-bottom: 24px !important;
          page-break-after: always !important;
        }
        .cover h1 {
          margin-bottom: 8px !important;
          color: #1a1a1a !important;
        }
        .cover .sub {
          color: #64748b !important;
          font-size: 14px !important;
        }
        .footer {
          margin-top: 32px !important;
          padding-top: 16px !important;
          border-top: 1px dashed #e5e7eb !important;
          color: #6b7280 !important;
          font-size: 12px !important;
          text-align: center !important;
        }
        .cover {
          page-break-after: always;
        }
        .toc {
          page-break-after: always;
        }
        h1, h2, h3 {
          page-break-after: avoid;
        }
        p, li {
          orphans: 3;
          widows: 3;
        }
        /* 隐藏浏览器默认的页眉页脚 */
        @page {
          margin: 2cm !important;
          size: A4;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
        /* 确保没有额外的页眉页脚 */
        ::-webkit-scrollbar {
          display: none;
        }
      }
    </style>
  `;
  
  // 创建打印内容
  const printContent = document.getElementById('preview').cloneNode(true);
  printContent.className = 'print-content';
  
  // 应用字体选择到打印内容
  const fontFamily = document.getElementById('fontFamily').value;
  if(fontFamily && fontFamily !== 'default') {
    printContent.classList.add('font-' + fontFamily);
  }
  
  // 创建打印窗口
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(title)}</title>
      ${printStyles}
    </head>
    <body>
      ${printContent.outerHTML}
    </body>
    </html>
  `);
  printWindow.document.close();
  
  // 等待内容加载完成后打印
  printWindow.onload = function() {
    setTimeout(() => {
      printWindow.print();
      // 打印对话框关闭后关闭窗口
      printWindow.onafterprint = function() {
        printWindow.close();
      };
    }, 500);
  };
  
  console.log('PDF导出（打印模式）已启动');
}

// 显示使用说明
function showHelp() {
  const helpContent = `
# Share Writer - 软件介绍与使用说明

## 📖 软件简介

**Share Writer** 是一款专为内容创作者、分析师和专业人士设计的在线文档排版与导出工具。它能够将 Markdown 格式的文本内容快速转换为美观的文档，并支持一键导出为多种格式，让您的分析报告、技术文档和商务文件更加专业规范。

### 核心特色
- 🚀 **实时预览** - 所见即所得的编辑体验
- 🎨 **多主题排版** - 支持简洁和经典两种视觉风格
- 📄 **智能导出** - 支持图片、微信HTML、纯文本、HTML、Word、PDF等多种格式
- 📑 **自动目录** - 根据标题层级自动生成文档目录
- 🏷️ **封面定制** - 可添加文档标题、作者信息和生成日期
- 🤖 **智能标题识别** - 自动识别Markdown大标题并填写到文档标题框

## 🛠️ 使用指南

### 1. 基础操作

**① 输入内容**
- 在左侧文本框中粘贴或输入您的文档内容
- **智能标题识别**：自动识别第一个 \`# 标题\` 并填写到"文档标题"框，同时从正文中移除该标题
- 支持标准的 Markdown 语法：
  - \`# 一级标题\`、\`## 二级标题\`、\`### 三级标题\`
  - \`**加粗文本**\`、\`*斜体文本*\`
  - \`- 列表项\` 或 \`1. 有序列表\`
  - \`> 引用内容\`
  - \`\` \`行内代码\` \`\` 和代码块

**② 实时预览**
- 右侧区域会实时显示格式化后的效果
- 点击"生成预览"按钮或使用 \`Ctrl + Enter\` 快捷键刷新预览

### 2. 文档定制

**主题选择**
- **简洁（无衬线）** - 现代简洁风格，适合技术文档
- **经典（衬线）** - 传统印刷风格，适合正式报告

**版心设置**
- **标准** - 适中宽度，阅读舒适
- **窄版** - 更窄的版心，适合小屏阅读
- **宽版** - 更宽的版心，展示更多内容

**封面与目录**
- **封面+目录** - 完整的文档结构
- **仅封面** - 只添加封面页
- **仅目录** - 只生成目录导航
- **都不要** - 纯正文内容

### 3. 元信息设置

**文档标题**
- 输入文档的主标题
- 如未填写，默认为"未命名分析"

**作者/团队**
- 填写文档作者或团队名称
- 会显示在封面和页脚信息中

### 4. 导出功能

**📷 导出图片（推荐微信分享）**
- 生成高清 PNG 图片，完美保留排版效果
- 可直接在微信中发送和分享
- 文件扩展名：\`.png\`
- 适合朋友圈、群聊分享

**💬 微信版HTML**
- 专门优化的 HTML 格式，微信可预览
- 简化样式，确保微信内显示正常
- 文件扩展名：\`_微信版.html\`
- 适合微信内打开和分享

**📄 纯文本**
- 生成纯文本格式，无任何样式
- 可直接复制粘贴到微信聊天
- 文件扩展名：\`.txt\`
- 适合快速分享和转发

**导出 HTML**
- 生成完整的 HTML 文件，保留所有样式
- 适合网页发布、邮件发送或在线分享
- 文件扩展名：\`.html\`

**导出 Word**
- 生成 Microsoft Word 兼容的文档
- 使用专业的 Word 样式和排版
- 文件扩展名：\`.doc\`
- 可在 Microsoft Word 中完美打开和编辑

## 💡 使用技巧

### 最佳实践
1. **结构化写作** - 使用多级标题（##、###）来组织内容结构
2. **智能标题** - 在文档开头使用 \`# 标题\` 格式，系统会自动识别并处理
3. **列表清晰** - 使用无序列表展示要点，有序列表展示步骤
4. **代码高亮** - 使用代码块来展示程序代码或配置信息
5. **引用强调** - 使用引用块来突出重要观点或他人言论

### 快捷键
- \`Ctrl + Enter\` - 快速刷新预览
- 所有操作均可通过鼠标点击完成

### 导出建议
- **微信分享** - 使用图片格式，效果最佳，传播最广
- **微信内预览** - 使用微信版HTML，可在微信中打开
- **快速转发** - 使用纯文本格式，直接复制粘贴
- **内部分享** - 使用 HTML 格式，保持最佳视觉效果
- **正式提交** - 使用 Word 格式，便于他人编辑和打印
- **打印存档** - 使用 PDF 格式，适合打印和长期保存
- **长期存档** - 建议同时保存多种格式

## 🔧 技术特性

### 兼容性
- 支持所有现代浏览器（Chrome、Firefox、Safari、Edge）
- 生成的 Word 文档兼容 Microsoft Word 2007 及以上版本
- 纯前端实现，无需服务器支持，保护数据隐私

### 文件格式
- **图片导出** - 生成高清PNG图片，微信分享效果最佳
- **微信HTML** - 专门优化的HTML格式，微信内可预览
- **纯文本** - 纯文本格式，可直接复制到微信
- **HTML 导出** - 包含完整的内联样式，独立可运行
- **Word 导出** - 使用标准的 Word HTML 格式，专业排版
- **PDF 导出** - 使用浏览器打印功能，适合打印和存档

## 🎯 适用场景

### 业务分析
- 市场分析报告
- 竞品分析文档
- 项目可行性研究

### 技术文档
- API 接口说明
- 技术方案设计
- 系统架构文档

### 学术写作
- 研究报告
- 论文草稿
- 学术笔记

### 日常办公
- 会议纪要
- 工作汇报
- 培训材料

## 📞 获取支持

Share Writer 是一个开源工具，如果您遇到问题或有改进建议：
1. 检查浏览器控制台是否有错误信息
2. 确保网络连接正常
3. 尝试刷新页面重新加载

---

**开始使用**：只需在左侧输入您的 Markdown 内容，调整右侧的设置选项，然后导出您需要的格式即可获得专业级的文档输出！

*Share Writer - 让文档排版变得简单高效* ✨
  `;

  // 创建弹窗
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    border-radius: 12px;
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
    padding: 24px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    position: relative;
  `;

  // 关闭按钮
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 12px;
    right: 12px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  closeBtn.onmouseover = () => closeBtn.style.background = '#f5f5f5';
  closeBtn.onmouseout = () => closeBtn.style.background = 'none';

  // 解析Markdown内容
  const htmlContent = marked.parse(helpContent);
  content.innerHTML = htmlContent;
  content.appendChild(closeBtn);

  modal.appendChild(content);
  document.body.appendChild(modal);

  // 关闭功能
  const closeModal = () => {
    document.body.removeChild(modal);
  };

  closeBtn.onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // ESC键关闭
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}

// 事件
document.getElementById('btnPreview').addEventListener('click',render);
document.getElementById('btnExportImage').addEventListener('click',exportImage);
document.getElementById('btnExportWechatHtml').addEventListener('click',exportWechatHTML);
document.getElementById('btnExportText').addEventListener('click',exportText);
document.getElementById('btnExportHtml').addEventListener('click',exportHTML);
document.getElementById('btnExportDocx').addEventListener('click',exportDOCX);
document.getElementById('btnExportPdf').addEventListener('click',exportPDF);
document.getElementById('btnSendEmail').addEventListener('click',sendEmail);
document.getElementById('btnHelp').addEventListener('click',showHelp);
document.getElementById('theme').addEventListener('change',render);
document.getElementById('width').addEventListener('change',render);
document.getElementById('fontFamily').addEventListener('change',render);
document.getElementById('frontmatter').addEventListener('change',render);
document.getElementById('docTitle').addEventListener('input',render);
document.getElementById('docAuthor').addEventListener('input',render);
document.getElementById('src').addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){ e.preventDefault(); render(); }
});
document.getElementById('src').addEventListener('input',function(){
  updateStats();
  // 自动处理标题识别
  const src = this.value.trim();
  const detectedTitle = extractTitleFromMarkdown(src);
  if (detectedTitle) {
    // 自动填写到文档标题输入框
    document.getElementById('docTitle').value = detectedTitle;
    // 从内容中移除大标题
    const contentWithoutTitle = removeTitleFromContent(src);
    // 更新文本区域内容（避免无限循环）
    if (contentWithoutTitle !== src) {
      this.value = contentWithoutTitle;
    }
  }
});

// 初始示例
document.getElementById('src').value =
`# 卫健系统人事调整后的 IVD 战略路标（示例）
> 这里粘贴你的分析内容。支持 **Markdown**：列表 / 引用 / 代码块等。

## 先给结论（TL;DR）
- 去争议化 + 强专业化
- 班子"公卫+医政+大病管理"更均衡
- IVD：监测稳定增长，院内更看成本—效果

## 重点方向
1. 公卫监测（多病原/AMR/院感）
2. 医政高质量发展（DRG/DIP 适配）
3. 心脑血管专病网络（胸痛/卒中中心）`;

// 触发自动标题识别
const initialSrc = document.getElementById('src').value.trim();
const detectedTitle = extractTitleFromMarkdown(initialSrc);
if (detectedTitle) {
  document.getElementById('docTitle').value = detectedTitle;
  const contentWithoutTitle = removeTitleFromContent(initialSrc);
  document.getElementById('src').value = contentWithoutTitle;
}

render();
