import { ChangeDetectorRef, Component } from '@angular/core';
import { Icon, Map, TileLayer, LayerGroup, marker, LatLngLiteral, MarkerOptions } from 'leaflet';
import { CapacitorHttp } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public map!: Map;
  private currentLocation: LatLngLiteral = {
    lat: 0,
    lng: 0,
    alt: 0
  };
  private settings = {
    appiumId: `io.appium.settings`, //APPID dari Appium, kalau build pakai custom APPID silahkan diganti
    offsetKeypress: 0.00001, //Seberapa jauh offset saat jalan-jalan pakai keyboard (WASD)
    adbInterval: 2000, //Interval dalam ms. Kalau ADB command terpanggil sebelum interval selesai, maka command akan dihiraukan
    apiUrl: `http://localhost:8888/adb`, //API untuk ADB server, karena implementasi adb langsung dari Node sulit jadi kita pake php saja
    defaultLoc: { //Default location
      lat: -6.1753624,
      lng: 106.8271328,
      alt: 0
    }
  };
  public tempSettings = this.settings;
  public showSettings: boolean = false;
  public leafletOptions = {
    zoom: 17,
    maxZoom: 25,
    zoomControl: false,
    preferCanvas: true,
    attributionControl: false,
    center: this.settings.defaultLoc,
    layers: [
      new TileLayer('https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}')
    ],
  };
  public coolDown: boolean = false;
  private layerGroups: layers = {
    worker: new LayerGroup(),
    location: new LayerGroup(),
  }

  constructor(
    private ref: ChangeDetectorRef,
  ) { }

  async checkSaved(){
    const s = (await Preferences.get({key:"settings"})).value;
    if(s!=null) this.settings = JSON.parse(s);
    this.currentLocation = this.defLoc();
  }

  toggleSettings(){
    this.tempSettings = JSON.parse(JSON.stringify(this.settings));
    this.showSettings = true;
  }
  async saveSettings(){
    const newSettings = JSON.stringify(this.tempSettings);
    await Preferences.set({key:"settings",value:newSettings});
    this.settings = JSON.parse(newSettings);
    this.showSettings = false;
  }

  defLoc():LatLngLiteral{
    return this.settings.defaultLoc;
  }

  setPosition(pos:LatLngLiteral){
    this.curLoc = pos;
    this.placeMarker(pos, `worker`);
    this.callAdb({types:"start"});
  }

  resetZoom(){
    this.map.setView(this.curLoc, this.leafletOptions.zoom);
  }

  placeMarker(pos: LatLngLiteral, markType: markerType, title?:string){
    const icon = (name:markerType) => {
      let iconOpt: any = {
        iconUrl: `./assets/imgs/${name}.png`,
      };
      switch(name){
        case "worker":
          iconOpt.iconSize = [20.8, 34.1];
          iconOpt.iconAnchor = [5.4, 34.1];
          iconOpt.popupAnchor = [0, -34];
          break;
        case "location":
          iconOpt.iconSize = [25, 50];
          break;
      }
      return new Icon(iconOpt);
    };
    if(markType=="worker") this.layerGroups[markType].clearLayers();
    let markerOpt: MarkerOptions = {
      icon: icon(markType),
      keyboard: false,
    }
    if(title) markerOpt.title=title;
    const ppl = marker(pos, markerOpt);
    this.layerGroups[markType].addLayer(ppl);
  };

  async loadLocations():Promise<void>{
    let isValid = (jsonString:string) => {
      let valid = true;
      try {
        const j = Object.keys(JSON.parse(jsonString)[0]);
        const keyNeeded = ["lat","lng","name"];
        for(let k of keyNeeded){
          if(!j.includes(k)){
            valid = false;
          }
        }
      } catch (e) {
        valid = false;
      }
      return valid;
    }
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (_) => { 
      const fr = new FileReader();
      const item = await input.files?.item(0);
      if(item!=null){
        fr.readAsText(item);
        fr.onload = async (e) =>{
          const loaded = e?.target?.result;
          if(loaded!=null && isValid(loaded as string)){
            try {
              this.layerGroups.location.clearLayers();
              const newPoint = JSON.parse(loaded as string);
              for(let p of newPoint){
                this.placeMarker({lat:p.lat??0,lng:p.lng??0},"location",p.name??'Unnamed Location');
              }
              console.log(`${newPoint.length} Locations Loaded!`);
            } catch(err) {
              console.log("Error:",err);
            }
          } else {
            console.log("Invalid file!");
          }
        }
      }
    }
    input.click();
  }

  async postAPI(suffix:string,data:{[what:string]:string}){
    const httpReply = await CapacitorHttp.post({
      url:`${this.settings.apiUrl}/${suffix}`,
      data: data,
      headers:{'content-type': 'application/x-www-form-urlencoded; charset=utf-8'}
    });
    console.log(httpReply);
  }

  callAdb(opt:adbOptions){
    if(this.coolDown==false){
      const latOld = this.latitude;
      const lngOld = this.longitude;
      this.coolDown = true;
      const mockOpts = {
        appiumId: this.settings.appiumId,
        lat: this.latitude,
        lng: this.longitude,
        alt: this.settings.defaultLoc.alt,
        status: opt.types,
      };
      this.postAPI('mock_gps',{mock_options:JSON.stringify(mockOpts)});
      setTimeout(() => {
        this.coolDown = false;
        if(latOld!=this.latitude || lngOld!=this.longitude){
          this.callAdb(opt);
        }
      }, this.settings.adbInterval);
    }
  }

  public async onMapReady(lMap: Map) {
    await this.checkSaved();
    //Init
    this.map = lMap;
    for(let layers of Object.keys(this.layerGroups)) {
      this.map.addLayer(this.layerGroups[layers as markerType]);
    }
    setTimeout(() => lMap.invalidateSize(true), 500);
    this.setPosition({lat:this.latitude,lng:this.longitude});
    this.resetZoom();
    //Listener
    this.map.on('click',e=>{
      this.setPosition({lat:e.latlng.lat,lng:e.latlng.lng});
    });
    this.map.on("keydown",e=>{
      switch(e.originalEvent.key.toLowerCase()){
        case "w":
          this.setPosition({lat:(this.latitude+this.settings.offsetKeypress),lng:(this.longitude)});
          break;
        case "s":
          this.setPosition({lat:(this.latitude-this.settings.offsetKeypress),lng:(this.longitude)});
          break;
        case "a":
          this.setPosition({lat:(this.latitude),lng:(this.longitude-this.settings.offsetKeypress)});
          break;
        case "d":
          this.setPosition({lat:(this.latitude),lng:(this.longitude+this.settings.offsetKeypress)});
          break;
      }
    })
  }

  set curLoc(pos:LatLngLiteral){
    this.latitude = pos.lat;
    this.longitude = pos.lng;
  }
  get curLoc():LatLngLiteral{
    return {
      lat: this.latitude,
      lng: this.longitude,
    };
  }

  set latitude(lat:number){
    this.currentLocation.lat = lat;
    this.ref.detectChanges();
  }
  get latitude():number{
    return this.currentLocation.lat;
  }

  set longitude(lng:number){
    this.currentLocation.lng = lng;
    this.ref.detectChanges();
  }
  get longitude():number{
    return this.currentLocation.lng;
  }
}

type adbCommandType = "start"|"stop";
type adbOptions = { types: adbCommandType };
type markerType = "worker"|"location";
type layers = {
  [types in markerType]: LayerGroup;
};