import express from 'express';
import { execSync } from 'child_process';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const PORT = 8888;
app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Function
function mockGPS(cmd,targets){
    let cmdString = ``;
    if(cmd){
        if(targets.length>0){
            let output = [];
            let isOK = true;
            for(let target of targets){
                try {
                    console.log(`Target Device: ${target}`);
                    let mockOpts = JSON.parse(cmd??"{}");
                    if(mockOpts.status=='start') cmdString = `adb -s ${target} shell am start-foreground-service --user 0 -n ${mockOpts.appiumId??'io.appium.settings'}/.LocationService --es longitude ${mockOpts.lng??0} --es latitude ${mockOpts.lat??0} --es altitude ${mockOpts.alt??0}`;
                    if(mockOpts.status=='stop') cmdString = `adb -s ${target} shell am stopservice ${mockOpts.appiumId??'io.appium.settings'}/.LocationService`;
                    const o = execSync(cmdString, { encoding: 'utf-8' });
                    console.log("OK");
                    output.push(o);
                    console.log(`=============== Exec ===============\r\n${cmdString}\r\n============== Output ==============\r\n${o}\r\n====================================\r\n`);
                } catch (err) {
                    isOK = false;
                    output.push(err.message);
                    console.log(`=============== Exec ===============\r\n${cmdString}\r\n============== Output ==============\r\n${err.message}\r\n====================================\r\n`);
                }
            }
            return {success:(isOK),output:output.join(",")};
        }
        return {success:false,output:`Target device not specified!`};
    }
    return false;
};

function deviceLists(){
    const parseVal = (str) => {
        let devices = [];
        const regExp = /([a-zA-Z0-9]+[\t])([a-z]*)/g;
        for(let matched of str.match(regExp)){
            const d = matched.split("\t");
            devices.push({serial:d[0],status:d[1]});
        }
        return devices;
    }
    try {
        const cmdString = `adb devices`;
        const output = parseVal(execSync(cmdString, { encoding: 'utf-8' }));
        return {success:true,output};
    } catch (err) {
        return {success:false,output:err.message};
    }
};

//Post
app.post('/adb', (req, res) => {
    res.status(400);
    res.json({message:"Function is required!",data:[]});
});
app.post('/adb/:function', (req, res) =>{
    let reply = {
        message: "",
        data: []
    };
    switch(req.params.function){
        case "device_list":
            const devices = deviceLists();
            if(devices.success){
                reply.message = "OK";
            } else {
                res.status(400);
                reply.message = "Error!";
            }
            reply.data = devices.output;
            break;
        case "mock_gps":
            const gps = mockGPS(req.body.mock_options,req.body.targets.split(","));
            if(!gps){
                res.status(400);
                reply.message = `Missing Options!`;
            } else {
                if(gps.success){
                    reply.message = "OK";
                } else {
                    res.status(400);
                    reply.message = "Error!";
                }
                reply.data = gps.output;
            }
            break;
        default:
            res.status(400);
            reply.message = `Invalid function: ${req.params.function}`;
            break;
    }
    res.json(reply);
});

//Route all unregistered
app.all('/', (req, res) => {
    res.json({message:'Server is running!',data:[]});
});
app.all('*', (req, res) => {
    res.redirect('/');
});
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));