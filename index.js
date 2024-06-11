const GS1DigitalLinkToolkit = require('./GS1DigitalLinkToolkit');
const parseBarcode = require('./BarcodeParser');
var gs1dlt = new GS1DigitalLinkToolkit();

let value = process.argv[2];

let responseArr = {};
let dateAIs = ['11', '12', '13', '15', '17'];
if (isValidUrl(value)) {
    try {
        gs1Array = gs1dlt.extractFromGS1digitalLink(value);
        for (i in gs1Array) {
            let obj = {
                ai: i,
                label: gs1dlt.aitable.find(x => x.ai === i).label,
                value: dateAIs.includes(i) ? gs1ToISO(gs1Array[i]) : gs1Array[i]
            }
            responseArr[i] = obj;
        }
        let res = {
            status:200,
            data:responseArr
        }
        console.log(JSON.stringify(res));
    } catch (err) {
        let res = {
            status:400,
            error:err
        }
        console.log(JSON.stringify(res));
    }
} else {
    try {
        let response = parseBarcode(value);
        if (response && Object.keys(response).length > 0) {
            let resposeData = response.parsedCodeItems;
            if(resposeData && resposeData.length>0){
                resposeData.map(function(data,index){
                    let obj = {
                        ai: data.ai,
                        label: data.dataTitle,
                        value: data.data
                    }
                    responseArr[data.ai] = obj;
                });
            }
            let res = {
                status:200,
                data:responseArr
            }
            console.log(JSON.stringify(res));
        }
    } catch (err) {
        let res = {
            status:400,
            error:err
        }
        console.log(JSON.stringify(res));
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (err) {
        return false;
    }
}

function gs1ToISO(gs1Date) {
    let rv = "";
    let regexDate = new RegExp("^\\d{6}$");
    if (gs1Date !== undefined && regexDate.test(gs1Date)) {
        let doubleDigits = gs1Date.split(/(\d{2})/);
        let year = parseInt(doubleDigits[1]);
        let currentYear = new Date().getFullYear().toString();
        let currentLastYY = parseInt(currentYear.substr(-2));
        let currentFirstYY = parseInt(currentYear.substr(0, 2));
        let diff = year - currentLastYY;
        let fullyear = currentFirstYY.toString() + year.toString();
        if (diff >= 51 && diff <= 99) {
            fullyear = (currentFirstYY - 1).toString() + year.toString();
        }
        if (diff >= -99 && diff <= -50) {
            fullyear = (currentFirstYY + 1).toString() + year.toString();
        }
        if (fullyear !== undefined) {
            rv = fullyear + '-' + doubleDigits[3];
            if (doubleDigits[5] != '00') {
                rv += '-' + doubleDigits[5];
            }
        }
    }
    return rv;
}