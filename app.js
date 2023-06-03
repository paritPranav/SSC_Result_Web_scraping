const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const student = require("./studentDetails");
const XLSX = require("xlsx");
//let finalData=[];
const express = require("express");
require("dotenv/config");
const app = express();
const fs=require("fs")


//CSV datatype class......
class Result{
  constructor(
    Seat_Number = "",
    Student_name = "",
    Mother_Name = "",
    Marathi = "",
    Hindi = "",
    English = "",
    Maths = "",
    Science = "",
    socialScience = "",
    total = "",
    percentage = "",
    result = ""
  ) {
    this.stud_name = Student_name;
    this.seat_no = Seat_Number;
    this.mother_name = Mother_Name;
    this.marathi_marks = Marathi;
    this.hindi_marks = Hindi;
    this.english_marks = English;
    this.maths_marks = Maths;
    this.science_marks = Science;
    this.socialScience_marks = socialScience;
    this.total_Makrs = total;
    this.percentage = percentage;
    this.result = result;
  }
  //append the data in CSV
  saveAsCSV() {
    const csv = `${this.seat_no},${this.stud_name},${this.mother_name},${this.marathi_marks},${this.hindi_marks},${this.english_marks},${this.maths_marks},${this.science_marks},${this.socialScience_marks},${this.total_Makrs},${this.percentage},${this.result}\n`;
    try {
      fs.appendFileSync("./Output_Result.csv", csv);
    } catch (err) {
      console.error(err);
    }
    console.log("added")
  }
}
//creating object  and creating  record....
function createRecord(
  Seat_Number,
  Student_name,
  Mother_Name,
  Marathi,
  Hindi,
  English,
  Maths,
  Science,
  socialScience,
  total,
  percentage,
  result
) {
  const record = new Result(
    Seat_Number,
    Student_name,
    Mother_Name,
    Marathi,
    Hindi,
    English,
    Maths,
    Science,
    socialScience,
    total,
    percentage,
    result
  );
  record.saveAsCSV();
};


//DB connection............
mongoose.connect(
  process.env.DB_Connect,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

//Delay ............................
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//loading data from CSV...............................
const loadcsv = async () => {
  const file = "/home/pranav/Downloads/data.xlsx";
  const workbook = XLSX.readFile(file);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const headers = data[0];
  const formattedData = data.slice(1).map(async(row) => {
    const rowData = {};
    headers.forEach((header, index) => {
      rowData[header] = row[index];
    });
    
    const newstudent=new student({
          
      seat_Number: rowData.seatno,
      mother_Name: rowData.mother
    
    })
    try{
        newstudent.save()
    }catch(err){
      console.log(err);
    }
   
  });

  console.log("Done");
};

//loadcsv();

allresults = [];

//fetch data from database and iterate alog with mothername and seat number
async function getResult() {
  lim = 5;
  console.log("1")
  let finalData = await student.find({});
  len = finalData.length;
  lap = 3;

  while (lap * lim <= len) {
    let data = await student
      .find({})
      .limit(lim)
      .skip(lap * lim);

    data.map(async (stud) => {
      await checkresult(stud.seat_Number, stud.mother_Name);
    });

    lap++;
    await delay(3000);
  }
}

//getting all result data from https://ssc.mahresults.org.in/  site.....by web scarping.....
async function checkresult(seat_Number, mother_Name) {


  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://ssc.mahresults.org.in/");

  // console.log(seat_Number)
  // console.log(mother_Name )

  await Promise.all([page.type("#txtSeatNo", seat_Number)]);
  await delay(1500);
  await Promise.all([page.type("#txtMotherName", mother_Name)]);
  await delay(1500);
  await Promise.all([page.click("#btnProceed"), page.waitForNavigation()]);

  await delay(1500);

  const stud_name = await page.evaluate(() => {
    return document.querySelector("#lblCandidateName").textContent;
  });
  const seat_no = await page.evaluate(() => {
    return document.querySelector("#lblSeatNo").textContent;
  });
  const mother_name = await page.evaluate(() => {
    return document.querySelector("#lblMotherName").textContent;
  });
  const marathi_marks = await page.evaluate(() => {
    return document.querySelector("#lblMarks1").textContent;
  });
  const hindi_marks = await page.evaluate(() => {
    return document.querySelector("#lblMarks2").textContent;
  });
  const english_marks = await page.evaluate(() => {
    return document.querySelector("#lblMarks3").textContent;
  });
  const maths_marks = await page.evaluate(() => {
    return document.querySelector("#lblMarks4").textContent;
  });
  const science_marks = await page.evaluate(() => {
    return document.querySelector("#lblMarks5").textContent;
  });
  const socialScience_marks = await page.evaluate(() => {
    return document.querySelector("#lblMarks6").textContent;
  });
  const total_Makrs = await page.evaluate(() => {
    return document.querySelector("#lblTotalMarks").textContent;
  });
  const percentage = await page.evaluate(() => {
    return document.querySelector("#lblPercentage").textContent.substring(1);
  });
  const result = await page.evaluate(() => {
    return document.querySelector("#lblResult").textContent.substring(8);
  });

  await console.log(stud_name);
  await console.log(seat_no);
  await console.log(mother_name);
  await console.log(marathi_marks);
  await console.log(hindi_marks);
  await console.log(english_marks);
  await console.log(maths_marks);
  await console.log(science_marks);
  await console.log(socialScience_marks);
  await console.log(total_Makrs);
  await console.log(percentage);
  await console.log(result);


  //crrating record for csv..................
  createRecord( stud_name,
    seat_no,
    mother_name,
    marathi_marks,
    hindi_marks,
    english_marks,
    maths_marks,
    science_marks,
    socialScience_marks,
    total_Makrs,
    percentage,
    result)

  const newresult = {
    stud_name: stud_name,
    seat_no: seat_no,
    mother_name: mother_name,
    marathi_marks: marathi_marks,
    hindi_marks: hindi_marks,
    english_marks: english_marks,
    maths_marks: maths_marks,
    science_marks: science_marks,
    socialScience_marks: socialScience_marks,
    total_Makrs: total_Makrs,
    percentage: percentage,
    result: result,
  };
  allresults.push(newresult);

  await console.log("=================================");
  await browser.close();
}



app.listen(3003,()=>{
  console.log("Running")
})

///Main Calls
getResult();