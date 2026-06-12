const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, LevelFormat, PageBreak
} = require("C:\\Users\\HSQ\\AppData\\Roaming\\npm\\node_modules\\docx");

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function heading1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 }, children: [new TextRun({ text, bold: true, font: "Microsoft YaHei", size: 32 })] });
}
function heading2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 }, children: [new TextRun({ text, bold: true, font: "Microsoft YaHei", size: 28 })] });
}
function heading3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 }, children: [new TextRun({ text, bold: true, font: "Microsoft YaHei", size: 24 })] });
}
function para(text) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, font: "Microsoft YaHei", size: 22 })] });
}
function paraBold(label, text) {
  return new Paragraph({ spacing: { after: 120 }, children: [
    new TextRun({ text: label, bold: true, font: "Microsoft YaHei", size: 22 }),
    new TextRun({ text, font: "Microsoft YaHei", size: 22 })
  ] });
}
function bullet(text) {
  return new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text, font: "Microsoft YaHei", size: 22 })] });
}
function numbered(text) {
  return new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text, font: "Microsoft YaHei", size: 22 })] });
}

function makeTable(headers, rows) {
  const colCount = headers.length;
  const colWidth = Math.floor(9000 / colCount);
  const columnWidths = Array(colCount).fill(colWidth);
  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths,
    rows: [
      new TableRow({
        children: headers.map(h => new TableCell({
          borders,
          width: { size: colWidth, type: WidthType.DXA },
          shading: { fill: "FDE8F0", type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, font: "Microsoft YaHei", size: 20 })] })]
        }))
      }),
      ...rows.map(row => new TableRow({
        children: row.map(cell => new TableCell({
          borders,
          width: { size: colWidth, type: WidthType.DXA },
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: cell, font: "Microsoft YaHei", size: 20 })] })]
        }))
      }))
    ]
  });
}

const children = [
  // 标题
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
    new TextRun({ text: "\u{1F389} ", font: "Microsoft YaHei", size: 36 }),
    new TextRun({ text: "国内域名注册 + 服务器 + ICP备案指南", bold: true, font: "Microsoft YaHei", size: 36 }),
    new TextRun({ text: " \u{1F389}", font: "Microsoft YaHei", size: 36 }),
  ] }),
  para("本指南针对「生日贺卡生成器」项目，介绍如何在国内部署网站，包含域名注册、服务器选择、ICP备案流程和费用明细。"),

  // 一、域名注册
  heading1("一、域名注册（推荐平台）"),

  heading2("1. 阿里云（万网）"),
  bullet("网址：wanwang.aliyun.com"),
  bullet("支持：.cn / .com / .net / .xyz 等"),
  bullet(".cn 首年 9-29元，.com 约 55-75元/年"),
  bullet("支付：支付宝直接付款"),
  bullet("优点：备案流程成熟，和服务器绑定方便"),

  heading2("2. 腾讯云（DNSPod）"),
  bullet("网址：dnspod.cloud.tencent.com"),
  bullet("价格：和阿里云差不多，经常有新用户优惠"),
  bullet("支付：微信支付"),

  heading2("3. 域名选择建议"),
  makeTable(["域名类型", "价格", "推荐理由"], [
    [".cn", "首年 9-29元", "最便宜，国内专用足够"],
    [".com", "55-75元/年", "看起来正式，国际通用"],
    [".xyz / .top", "首年 1-5元", "预算极低，但显得不够正规"],
  ]),
  para(""),
  para("域名举例：shengri2026.cn、birthday-card.cn"),

  // 二、服务器选择
  heading1("二、服务器选择（纯静态网站）"),
  para("你的生日贺卡项目是纯前端静态页面，不需要买服务器！"),

  heading2("推荐方案：对象存储静态网站托管"),
  makeTable(["平台", "产品", "费用"], [
    ["阿里云", "OSS 静态网站托管", "存储约 0.12元/GB/月 + 流量费"],
    ["腾讯云", "COS 静态网站托管", "存储约 0.118元/GB/月 + 流量费"],
    ["七牛云", "Kodo 对象存储", "每月 10GB 存储 + 10GB 流量免费"],
  ]),
  para(""),
  para("项目总共不到 1MB，实际费用几乎为 0。"),

  heading2("腾讯云 COS 静态网站托管步骤"),
  numbered("注册腾讯云账号（微信扫码登录 + 实名认证）"),
  numbered("开通 COS 对象存储"),
  numbered("创建存储桶，选择“静态网站”模式"),
  numbered("上传 dist 目录下的所有文件"),
  numbered("绑定自定义域名（需要备案）"),
  numbered("开启 CDN 加速（可选）"),

  heading2("阿里云 OSS 静态网站托管步骤"),
  numbered("注册阿里云账号（支付宝直接登录 + 实名）"),
  numbered("开通 OSS"),
  numbered("创建 Bucket，读写权限设为“公共读”"),
  numbered("上传 dist 文件"),
  numbered("配置静态网站默认首页 index.html"),
  numbered("绑定域名（需要备案）"),

  heading2("如果未来需要后端（Supabase 替代）"),
  bullet("腾讯云轻量应用服务器：新用户约 50-100元/年"),
  bullet("阿里云 ECS 轻量：类似价格"),
  bullet("可以跑 Node.js / Python 后端"),

  // 三、ICP备案
  heading1("三、ICP备案（重要！）"),

  heading2("什么情况需要备案？"),
  makeTable(["情况", "是否需要备案"], [
    ["使用国内服务器/托管", "必须备案"],
    ["使用境外服务器（Cloudflare、Netlify等）", "不需要备案"],
    ["域名指向境外 IP", "不需要备案"],
  ]),

  heading2("备案前提条件"),
  numbered("已购买国内域名"),
  numbered("已购买国内服务器/云服务（需要有实例 ID）"),
  numbered("域名已完成实名认证（一般 1-3 个工作日）"),

  heading2("备案流程（以阿里云为例）"),

  heading3("第一步：准备材料"),
  bullet("身份证正反面照片"),
  bullet("个人手持身份证照片"),
  bullet("域名证书（在域名管理后台下载）"),
  bullet("手机号（用于接收验证码）"),
  bullet("邮箱"),

  heading3("第二步：提交备案"),
  numbered("登录阿里云控制台 → ICP备案"),
  numbered("填写主体信息（个人姓名、身份证、地址）"),
  numbered("填写网站信息（网站名称、域名、服务内容）"),
  numbered("上传材料照片"),
  numbered("提交审核"),

  heading3("第三步：审核流程"),
  makeTable(["环节", "时间", "说明"], [
    ["云服务商初审", "1-2 个工作日", "阿里云/腾讯云工作人员审核"],
    ["短信验证", "24小时内", "工信部发短信验证码，须确认"],
    ["管局审核", "5-20 个工作日", "各地不同，海南较慢"],
    ["备案成功", "收到备案号", "如“琼ICP备2025054550号”"],
  ]),

  // 四、备案注意事项
  heading1("四、备案注意事项"),

  heading2("1. 网站名称限制"),
  bullet("不能包含“博客”“论坛”“社区”等交互类词汇"),
  bullet("不能包含地名、行业名"),
  bullet("推荐名称：“元英小站”、“生日贺卡工具”"),

  heading2("2. 备案期间"),
  bullet("网站不能访问（管局会检查）"),

  heading2("3. 个人备案限制"),
  bullet("不能有用户注册/登录功能"),
  bullet("不能有评论/留言板"),
  bullet("不能涉及商业内容"),
  bullet("纯展示类网站最安全"),

  heading2("4. 备案后要求"),
  bullet("网站底部必须放备案号并链接到工信部网站"),
  bullet("网站内容必须和备案信息一致"),
  bullet("每年可能收到审核通知"),

  heading2("5. 各省管局审核速度"),
  makeTable(["地区", "审核时间"], [
    ["广东、浙江", "最快 5-7 天"],
    ["一般省份", "7-15 天"],
    ["海南、西藏", "较慢 15-20 天"],
  ]),

  // 五、费用总结
  heading1("五、费用总结"),

  heading2("最省方案（约 20-50元/年）"),
  makeTable(["项目", "费用"], [
    [".cn 域名", "9-29元/年"],
    ["腾讯云 COS 静态托管", "约 1-5元/年（流量极小）"],
    ["ICP备案", "免费"],
    ["总计", "约 10-35元/年"],
  ]),

  heading2("稳妥方案（约 60-130元/年）"),
  makeTable(["项目", "费用"], [
    [".com 域名", "55-75元/年"],
    ["阿里云 OSS 静态托管", "约 5-10元/年"],
    ["CDN 加速", "约 5-10元/年"],
    ["ICP备案", "免费"],
    ["总计", "约 65-95元/年"],
  ]),

  heading2("对比免费方案"),
  makeTable(["方案", "费用", "国内访问"], [
    ["Cloudflare Pages", "免费", "大部分地区可以"],
    ["Netlify", "免费", "不稳定"],
    ["GitHub Pages", "免费", "基本打不开"],
  ]),

  // 六、行动路线
  heading1("六、推荐行动路线"),

  heading2("立即（今天）"),
  bullet("部署到 Cloudflare Pages，马上可用"),
  bullet("注册 Cloudflare 账号（邮箱即可）"),

  heading2("短期（1-2周内）"),
  bullet("注册阿里云/腾讯云账号"),
  bullet("购买域名（建议 .cn，便宜）"),
  bullet("完成域名实名认证（1-3天）"),

  heading2("中期（2-4周内）"),
  bullet("提交 ICP 备案（审核 1-3周）"),
  bullet("开通 OSS/COS 静态托管"),
  bullet("备案通过后，域名解析到国内托管"),
  bullet("项目迁移到国内服务器"),

  heading2("长期（可选）"),
  bullet("如需后端数据库，购买轻量服务器"),
  bullet("配置 CDN 加速"),
  bullet("配置 HTTPS 证书（免费 Let’s Encrypt）"),
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Microsoft YaHei", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Microsoft YaHei" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Microsoft YaHei" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Microsoft YaHei" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [
        new TextRun({ text: "国内域名注册与备案指南", font: "Microsoft YaHei", size: 16, color: "999999" })
      ] })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: "第 ", font: "Microsoft YaHei", size: 16, color: "999999" }),
        new TextRun({ children: [PageNumber.CURRENT], font: "Microsoft YaHei", size: 16, color: "999999" }),
        new TextRun({ text: " 页", font: "Microsoft YaHei", size: 16, color: "999999" }),
      ] })] })
    },
    children
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("E:\\黄家专用\\1111\\国内域名注册与备案指南.docx", buffer);
  console.log("Done: E:\\黄家专用\\1111\\国内域名注册与备案指南.docx");
});
