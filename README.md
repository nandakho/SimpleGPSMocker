# SGM - Simple GPS Mocker
> [!NOTE]
> [Baca dalam Bahasa Indonesia](README.ID.md)
## What's This?
An app to control Android's GPS coordinate using Developer's Mock GPS from ADB with the help of [Appium](https://github.com/appium/io.appium.settings)
## How It Works
- Frontend displays map with Leaflet's library  
- Backend served by default on `localhost` port `8888`
- Frontend sends command to backend via POST Request to `localhost:8888`
- Backend then calls ADB Server with command to change coordinate
## App Setting
> [!NOTE]
> Settings can now be changed from frontend directly (upper right menu)  
> Any setting you changed is now saved in your browser, if you use the same browser all previous setting modified will carry over
### appiumId:
Default: `'io.appium.settings'`  
APPID of Appium. If you build it with custom APPID, change it here
### adbInterval
Default: `2000`  
Interval in milisecond. If ADB command is called again before the interval finished, the command will be ignored and recalled after the interval
### apiUrl
Default: `'http://localhost:8888/adb'`  
Your backend's API URL which connected to ADB Server
### offsetKeypress
Default: `0.00001`  
How much offset of latitude/longitude a keypress event adds to current coordinate
### offsetRandomize
Default: `false`  
If it's set to true, the number in `offsetKeypress` will be randomized between 0.5x ~ 1.5x of it's value
### defaultLoc
Default: *It's Monumen Nasional's location*  
```
{
    lat: -6.1753624,
    lng: 106.8271328,
    alt: 0
}
```  
Set your default coordinate here, it will be the initial location when the app is starting
### clickMovement
Default: `"direct"`  
Direct movement means immediately set your coordinate to the clicked location,  
set to `"walk"` to slowly walk towards the clicked location
### moveInterval
Default: `100`  
This is only used if `clickMovement` is set to `"walk"`  
The interval in ms of how long a "walk" will be triggered again after the last one
### moveOffset
Default: `0.00001`  
This is only used if `clickMovement` is set to `"walk"`  
The offset of how much one time "walk" is triggered
### moveOffsetRandomize
Default: `false`  
This is only used if `clickMovement` is set to `"walk"`  
If it's set to true, the number in `moveOffset` will be randomized between 0.5x ~ 1.5x of it's value
## Requirements
### Android
- ADB debugging in developer setting is activated, **does not require ROOT**
- Connected to your PC using any ADB methods (cable/local network etc)
- Android has approved ADB connection from PC
- [Appium](https://github.com/appium/io.appium.settings) is installed and it's permissions are set
### PC
- Active ADB Server
- Web Browser (Developed and tested with Chrome v123)
- Make sure your android device is shown with `adb devices` command
## Run
- Install all requirements with `npm i` in project root directory: `./` and in backend directory: `./backend`
- Make sure you are in project root directory `./` then run `npm run all` to start both Frontend & Backend  
*Note: This command is made for Windows OS. If you use any other OS, change it to suit your needs*
## Controlls
- Left Click (Mouse) on maps: change your coordinate to the clicked point
- WASD (Keyboard) on maps: move around the maps just like any games and set your coordinate to that point
- `Import Locations` button (Upper Left corner): import locations from a `.json` file (Look at [Location JSON](#location-json) for more information)
- Position (Lower Left corner): shows your coordinate, click on it to reset camera/view/zoom
## Location JSON
Load locations to be shown on maps  
Hover your mouse over any location point to show it's name  
JSON file uses this format or you can use [sample_location.json](sample_location.json) as an example:
```
[
    {
        "name": "Monumen Nasional",
        "lat": -6.1753924,
        "lng": 106.8271528
    },
    {
        "name": "First Location",
        "lat": 0,
        "lng": 0
    },
    ...
    {
        "name": "Last Location",
        "lat": 0,
        "lng": 0
    }
]
```