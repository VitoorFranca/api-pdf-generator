const express = require('express');
const exphbs  = require('express-handlebars');
const puppeteer = require('puppeteer');
const app = express();

const certificateMiddleware = require('./middlewares/certificateMiddleware');

app.use('/media', express.static('certificates'));
app.use(express.json());

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', (req, res) => {
  res.json({
    error: false,
    routes:
    [
      {
        endpoint: `https://${req.headers.host}/generate-certificate`,
        method: 'POST',
        body:
        {
          studentName: 'String',
          courseName: 'String'
        }
      }
    ]
  });

});

app.get('/certificate', (req , res) => {
  const { studentName, courseName } = req.query;

  res.render('certificate',
  {
    helpers: {
      studentName,
      courseName,
      date: getDate()
    }
  });

});

app.post('/generate-certificate', certificateMiddleware, async (req, res) => {
  const { studentName, courseName } = req.body;

  const fileName = `certificate-${randomHash()}`;
  const hostName = req.headers.host;

  try{
    await generateCertificate( hostName, fileName, studentName, courseName)

    res.json({ certificateFile: `https:/${hostName}/media/${fileName}.pdf` })

  } catch (error) {
    res.json({
      error: true,
      message: error
    });
  }
  
});

  //  Generate a pdf using Puppeteer
async function generateCertificate (hostName, fileName, studentName, courseName) {
  const URL = `https://${hostName}/certificate/?studentName=${studentName}&courseName=${courseName}`;

  const optionsPDF = {
    path: `./certificates/${fileName}.pdf`,
    printBackground: true,
    width: 912,
    height: 680
  }
  
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  const page = await browser.newPage();
  await page.goto(URL, {
    waitUntil: 'networkidle2',
  });

  await page.pdf(optionsPDF);
  await browser.close();

}

const randomHash = () => ( ( ( Date.now() * 10 ) * ( Math.random() * 10 ) ).toFixed() );

const getDate = (country) => {
  const now = new Date();
  return now.toLocaleDateString(country);
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('Server started.\nPORT: ', PORT));