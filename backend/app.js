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
function mockGPS(cmd){
    let cmdString = ``;
    if(cmd){
        try {
            let mockOpts = JSON.parse(cmd??"{}");
            if(mockOpts.status=='start') cmdString = `adb shell am start-foreground-service --user 0 -n ${mockOpts.appiumId??'io.appium.settings'}/.LocationService --es longitude ${mockOpts.lng??0} --es latitude ${mockOpts.lat??0} --es altitude ${mockOpts.alt??0}`;
            if(mockOpts.status=='stop') cmdString = `adb shell am stopservice ${mockOpts.appiumId??'io.appium.settings'}/.LocationService`;
            const output = execSync(cmdString, { encoding: 'utf-8' });
            console.log(`=============== Exec ===============\r\n${cmdString}\r\n============== Output ==============\r\n${output}\r\n====================================`);
            return {success:true,output};
        } catch (err) {
            return {success:false,output:err.message};
        }
    }
    return false;
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
        case "mock_gps":
            const gps = mockGPS(req.body.mock_options);
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