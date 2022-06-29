import './assets/css/style.css'
import {
  createMap,
  initInfoWindow,
  initMarkers,
  MarkerStorage,
  addProductSelectorOnChange,
} from "./map"

const GOOGLE_API_KEY = "AIzaSyCrHBMGwEmJtbpZvNEsYfOUq6HVEopLdDQ"
const MAP_ID = "map"
const APP_ID = "app"
const API_URL = "http://localhost:5000"
const AMOUNTS_URL = `${API_URL}/amounts`

// global storage
let markers: MarkerStorage
let infoWindow: google.maps.InfoWindow

const map = await createMap(APP_ID, MAP_ID, GOOGLE_API_KEY)
infoWindow = initInfoWindow()
markers = await initMarkers(map, infoWindow, AMOUNTS_URL)
addProductSelectorOnChange(map, infoWindow, markers, AMOUNTS_URL)
