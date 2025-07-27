// وارد کردن ابزارهای مورد نیاز از کتابخانه‌های داخلی Node.js و پکیج‌های دیگر
import fs from 'node:fs' // fs (File System): برای کار با فایل‌ها (خواندن، نوشتن، حذف کردن)
import path from 'node:path' // path: برای کار با مسیرهای فایل و دایرکتوری
import glob from 'glob' // glob: برای پیدا کردن فایل‌ها بر اساس الگو (pattern)
import stringify from 'stringify-object' // stringify-object: برای تبدیل یک شیء جاوااسکریپت به یک رشته خوانا
import url from 'node:url' // url: برای کار با URLها، به خصوص برای ماژول‌های ES

// --- متغیرها و توابع کمکی اولیه ---

// ریشه پروژه: مسیر دایرکتوری فایل فعلی (این اسکریپت) را مشخص می‌کند.
// این روش استاندارد در ماژول‌های ES برای به دست آوردن مسیر فایل است.
const root = path.dirname(url.fileURLToPath(import.meta.url))

// تابع کمکی برای ساخت مسیر کامل (absolute path) از یک مسیر نسبی (relative path) بر اساس ریشه پروژه.
const resolve = file => path.resolve(root, file)

// یک مجموعه (Set) برای ردیابی اسنیپت‌های کدی که استفاده شده‌اند.
// این کار برای جلوگیری از استفاده تکراری یا یافتن اسنیپت‌های بلااستفاده مفید است.
const snippetsUsed = new Set()

// --- توابع اصلی پردازش ---

/**
 * این تابع کد Pug را برای یک اسنیپت کد تولید می‌کند.
 * @param {string} value - رشته‌ای که شامل زبان و نام اسنیپت است (مثلاً 'js_my-component').
 * @returns {string} - رشته‌ای با سینتکس Pug برای فراخوانی کامپوننت کد.
 */
function genCode (value) {
  // زبان و نام اسنیپت را از رشته ورودی استخراج می‌کند.
  // برای مثال، 'js_my-component' به زبان 'js' و نام 'my-component' تبدیل می‌شود.
  const [lang, ...rest] = value.split('_')
  const name = rest.join('_')

  // مسیر کامل فایل اسنیپت کد (که یک فایل .txt است) را می‌سازد.
  const snippet = resolve(`../packages/docs/src/snippets/${lang}/${name}.txt`)

  // بررسی می‌کند که آیا این اسنیپت قبلاً استفاده شده است یا خیر.
  // اگر تکراری بود، یک هشدار در کنسول چاپ می‌کند.
  if (snippetsUsed.has(snippet)) console.log(`Snippet "${value}" used multiple times`)

  // اسنیپت فعلی را به مجموعه اسنیپت‌های استفاده شده اضافه می‌کند.
  snippetsUsed.add(snippet)

  // کد Pug را برای نمایش اسنیپت کد تولید می‌کند.
  // این کد از یک کامپوننت یا میکسین Pug به نام 'code' استفاده می‌کند
  // و زبان (lang) و منبع (src) را به عنوان پارامتر به آن می‌دهد.
  return `code(lang="${lang}" src="${name}")`
}

/**
 * یک 'گره' (node) از ساختار JSON را می‌گیرد و آن را به سینتکس Pug معادل تبدیل می‌کند.
 * @param {object} child - شیء گره از فایل JSON.
 * @returns {string} - رشته معادل با سینتکس Pug.
 */
function parse (child) {
  const {
    lang, // محتوای متنی گره
    type, // نوع گره (مثلاً 'heading', 'text', 'alert')
    value, // مقدار اضافی (می‌تواند رشته یا شیء باشد)
  } = child

  // بر اساس نوع گره، تصمیم می‌گیرد چه کدی تولید شود.
  switch (type) {
    case 'alert': return `alert(value="${value}") ${lang}` // کامپوننت alert
    case 'heading': return `\nh2 ${lang}` // تگ h2
    case 'markup': return genCode(value) // بلوک کد با فراخوانی genCode
    case 'text': return `| ${lang}` // متن ساده در Pug
  }

  // برای انواع دیگر، یک ساختار عمومی Pug ایجاد می‌کند.
  let ret = (type === 'up-next' ? '\n' : '') + type

  if (value) {
    ret += '('
    if (typeof value === 'string') {
      // اگر مقدار یک رشته باشد، به صورت یک property معمولی اضافه می‌شود.
      ret += `value="${value}"`
    } else if (typeof value === 'object') {
      // اگر مقدار یک شیء باشد، با فرمت‌بندی مناسب به یک رشته تبدیل می‌شود
      // تا به عنوان یک پراپرتی bind شده (v-bind یا :) در Pug/Vue استفاده شود.
      ret += `:value=\`${stringify(value, { indent: '  ' })}\``
    }
    ret += ')'
  }
  if (lang) ret += ` ${lang}`

  return ret
}

/**
 * این تابع یک ساختار درختی از گره‌ها را به صورت بازگشتی (recursively) پیمایش می‌کند
 * و یک آرایه مسطح از خطوط Pug را برمی‌گرداند.
 * @param {Array} children - آرایه‌ای از گره‌ها (فرزندان).
 * @returns {Array<string>} - یک آرایه مسطح از خطوط Pug.
 */
function recurse (children = []) {
  return children.reduce((acc, cur) => {
    // اگر گره فعلی خودش فرزندانی داشته باشد، تابع را به صورت بازگشتی برای آن‌ها فراخوانی می‌کند.
    if (cur.children && cur.children.length) {
      acc = [].concat(acc, recurse(cur.children))
    } else {
      // اگر گره فعلی یک برگ باشد (فرزندی نداشته باشد)، آن را با استفاده از تابع parse پردازش می‌کند.
      acc.push(parse(cur))
    }
    return acc
  }, [])
}

// --- بخش اصلی اجرای اسکریپت ---

// تابع کمکی برای ساخت مسیر فایل‌ها در دایرکتوری صفحات اسناد (docs).
const loc = str => resolve(`../packages/docs/src/data/pages/${str}`)

// با استفاده از glob، تمام فایل‌های .json را در دایرکتوری مشخص شده و زیرشاخه‌های آن پیدا می‌کند.
const files = glob.sync(resolve(`../packages/docs/src/data/pages/**/*.json`))

// روی هر فایل JSON پیدا شده حلقه می‌زند تا آن را پردازش کند.
for (const file of files) {
  // مسیر نسبی فایل را استخراج می‌کند تا برای خواندن فایل JSON و نوشتن فایل Pug استفاده شود.
  // مثلا: '.../pages/getting-started/installation.json' -> 'getting-started/installation'
  const path = file
    .split('/pages/')
    .pop()
    .split('/')
    .map(i => i.replace(/\.json/, ''))
    .join('/')

  // محتوای فایل JSON را می‌خواند و آن را به یک شیء جاوااسکریپت تبدیل (parse) می‌کند.
  const read = JSON.parse(fs.readFileSync(loc(`${path}.json`), 'utf8'))

  // تابع recurse را برای تبدیل کل ساختار JSON به رشته Pug فراخوانی می‌کند.
  // نتیجه را با خط جدید (\n) به هم می‌چسباند و فرمت‌بندی نهایی می‌کند.
  const children = recurse([read]).join('\n').trim() + '\n'

  // محتوای Pug تولید شده را در یک فایل جدید با همان نام ولی با پسوند .pug می‌نویسد.
  fs.writeFileSync(loc(`${path}.pug`), children, 'utf8')

  // فایل اصلی JSON را پس از تبدیل موفقیت‌آمیز، حذف می‌کند.
  fs.unlinkSync(file)
}

// این خط (که کامنت شده) می‌تواند برای حذف فایل‌های اسنیپت منبع (.txt) پس از استفاده، فعال شود.
// این کار به عنوان بخشی از فرآیند "پاک‌سازی" (cleanup) پس از ساخت پروژه مفید است.
// snippetsUsed.forEach(file => fs.unlinkSync(file))// وارد کردن ابزارهای مورد نیاز از کتابخانه‌های داخلی Node.js و پکیج‌های دیگر
import fs from 'node:fs' // fs (File System): برای کار با فایل‌ها (خواندن، نوشتن، حذف کردن)
import path from 'node:path' // path: برای کار با مسیرهای فایل و دایرکتوری
import glob from 'glob' // glob: برای پیدا کردن فایل‌ها بر اساس الگو (pattern)
import stringify from 'stringify-object' // stringify-object: برای تبدیل یک شیء جاوااسکریپت به یک رشته خوانا
import url from 'node:url' // url: برای کار با URLها، به خصوص برای ماژول‌های ES

// --- متغیرها و توابع کمکی اولیه ---

// ریشه پروژه: مسیر دایرکتوری فایل فعلی (این اسکریپت) را مشخص می‌کند.
// این روش استاندارد در ماژول‌های ES برای به دست آوردن مسیر فایل است.
const root = path.dirname(url.fileURLToPath(import.meta.url))

// تابع کمکی برای ساخت مسیر کامل (absolute path) از یک مسیر نسبی (relative path) بر اساس ریشه پروژه.
const resolve = file => path.resolve(root, file)

// یک مجموعه (Set) برای ردیابی اسنیپت‌های کدی که استفاده شده‌اند.
// این کار برای جلوگیری از استفاده تکراری یا یافتن اسنیپت‌های بلااستفاده مفید است.
const snippetsUsed = new Set()

// --- توابع اصلی پردازش ---

/**
 * این تابع کد Pug را برای یک اسنیپت کد تولید می‌کند.
 * @param {string} value - رشته‌ای که شامل زبان و نام اسنیپت است (مثلاً 'js_my-component').
 * @returns {string} - رشته‌ای با سینتکس Pug برای فراخوانی کامپوننت کد.
 */
function genCode (value) {
  // زبان و نام اسنیپت را از رشته ورودی استخراج می‌کند.
  // برای مثال، 'js_my-component' به زبان 'js' و نام 'my-component' تبدیل می‌شود.
  const [lang, ...rest] = value.split('_')
  const name = rest.join('_')

  // مسیر کامل فایل اسنیپت کد (که یک فایل .txt است) را می‌سازد.
  const snippet = resolve(`../packages/docs/src/snippets/${lang}/${name}.txt`)

  // بررسی می‌کند که آیا این اسنیپت قبلاً استفاده شده است یا خیر.
  // اگر تکراری بود، یک هشدار در کنسول چاپ می‌کند.
  if (snippetsUsed.has(snippet)) console.log(`Snippet "${value}" used multiple times`)

  // اسنیپت فعلی را به مجموعه اسنیپت‌های استفاده شده اضافه می‌کند.
  snippetsUsed.add(snippet)

  // کد Pug را برای نمایش اسنیپت کد تولید می‌کند.
  // این کد از یک کامپوننت یا میکسین Pug به نام 'code' استفاده می‌کند
  // و زبان (lang) و منبع (src) را به عنوان پارامتر به آن می‌دهد.
  return `code(lang="${lang}" src="${name}")`
}

/**
 * یک 'گره' (node) از ساختار JSON را می‌گیرد و آن را به سینتکس Pug معادل تبدیل می‌کند.
 * @param {object} child - شیء گره از فایل JSON.
 * @returns {string} - رشته معادل با سینتکس Pug.
 */
function parse (child) {
  const {
    lang, // محتوای متنی گره
    type, // نوع گره (مثلاً 'heading', 'text', 'alert')
    value, // مقدار اضافی (می‌تواند رشته یا شیء باشد)
  } = child

  // بر اساس نوع گره، تصمیم می‌گیرد چه کدی تولید شود.
  switch (type) {
    case 'alert': return `alert(value="${value}") ${lang}` // کامپوننت alert
    case 'heading': return `\nh2 ${lang}` // تگ h2
    case 'markup': return genCode(value) // بلوک کد با فراخوانی genCode
    case 'text': return `| ${lang}` // متن ساده در Pug
  }

  // برای انواع دیگر، یک ساختار عمومی Pug ایجاد می‌کند.
  let ret = (type === 'up-next' ? '\n' : '') + type

  if (value) {
    ret += '('
    if (typeof value === 'string') {
      // اگر مقدار یک رشته باشد، به صورت یک property معمولی اضافه می‌شود.
      ret += `value="${value}"`
    } else if (typeof value === 'object') {
      // اگر مقدار یک شیء باشد، با فرمت‌بندی مناسب به یک رشته تبدیل می‌شود
      // تا به عنوان یک پراپرتی bind شده (v-bind یا :) در Pug/Vue استفاده شود.
      ret += `:value=\`${stringify(value, { indent: '  ' })}\``
    }
    ret += ')'
  }
  if (lang) ret += ` ${lang}`

  return ret
}

/**
 * این تابع یک ساختار درختی از گره‌ها را به صورت بازگشتی (recursively) پیمایش می‌کند
 * و یک آرایه مسطح از خطوط Pug را برمی‌گرداند.
 * @param {Array} children - آرایه‌ای از گره‌ها (فرزندان).
 * @returns {Array<string>} - یک آرایه مسطح از خطوط Pug.
 */
function recurse (children = []) {
  return children.reduce((acc, cur) => {
    // اگر گره فعلی خودش فرزندانی داشته باشد، تابع را به صورت بازگشتی برای آن‌ها فراخوانی می‌کند.
    if (cur.children && cur.children.length) {
      acc = [].concat(acc, recurse(cur.children))
    } else {
      // اگر گره فعلی یک برگ باشد (فرزندی نداشته باشد)، آن را با استفاده از تابع parse پردازش می‌کند.
      acc.push(parse(cur))
    }
    return acc
  }, [])
}

// --- بخش اصلی اجرای اسکریپت ---

// تابع کمکی برای ساخت مسیر فایل‌ها در دایرکتوری صفحات اسناد (docs).
const loc = str => resolve(`../packages/docs/src/data/pages/${str}`)

// با استفاده از glob، تمام فایل‌های .json را در دایرکتوری مشخص شده و زیرشاخه‌های آن پیدا می‌کند.
const files = glob.sync(resolve(`../packages/docs/src/data/pages/**/*.json`))

// روی هر فایل JSON پیدا شده حلقه می‌زند تا آن را پردازش کند.
for (const file of files) {
  // مسیر نسبی فایل را استخراج می‌کند تا برای خواندن فایل JSON و نوشتن فایل Pug استفاده شود.
  // مثلا: '.../pages/getting-started/installation.json' -> 'getting-started/installation'
  const path = file
    .split('/pages/')
    .pop()
    .split('/')
    .map(i => i.replace(/\.json/, ''))
    .join('/')

  // محتوای فایل JSON را می‌خواند و آن را به یک شیء جاوااسکریپت تبدیل (parse) می‌کند.
  const read = JSON.parse(fs.readFileSync(loc(`${path}.json`), 'utf8'))

  // تابع recurse را برای تبدیل کل ساختار JSON به رشته Pug فراخوانی می‌کند.
  // نتیجه را با خط جدید (\n) به هم می‌چسباند و فرمت‌بندی نهایی می‌کند.
  const children = recurse([read]).join('\n').trim() + '\n'

  // محتوای Pug تولید شده را در یک فایل جدید با همان نام ولی با پسوند .pug می‌نویسد.
  fs.writeFileSync(loc(`${path}.pug`), children, 'utf8')

  // فایل اصلی JSON را پس از تبدیل موفقیت‌آمیز، حذف می‌کند.
  fs.unlinkSync(file)
}

// این خط (که کامنت شده) می‌تواند برای حذف فایل‌های اسنیپت منبع (.txt) پس از استفاده، فعال شود.
// این کار به عنوان بخشی از فرآیند "پاک‌سازی" (cleanup) پس از ساخت پروژه مفید است.
// snippetsUsed.forEach(file => fs.unlinkSync(file))
