import ALKO_PRODUCTS from "./assets/data/alko_products_available.json"
import COORDINATES from "./assets/data/alko_coordinates_no_noutopiste.json"
import { Loader } from 'google-maps'
import {
  fetchAmounts,
  /* getStoreCoordinates, */
  getIcon,
  StoreAmount,
  getStoreName,
} from "./util";

const DIV_SELECTOR_ID = "product-selector";
const SELECT_ID = "select-huttunen";

export interface MarkerStorage {
  [key: string]: google.maps.Marker;
}

function addMapElement(app: HTMLDivElement, mapId: string): void {
  const el = document.createElement("div");
  el.id = mapId;
  app.appendChild(el);
}

function addProductSelector(app: HTMLDivElement): void {
  const div = document.createElement("div");
  div.id = DIV_SELECTOR_ID;

  const label = document.createElement("label");
  label.htmlFor = div.id;
  label.innerText = "Valitse janojuoma";
  div.appendChild(label);

  const select = document.createElement("select");
  select.id = SELECT_ID;
  div.appendChild(select);

  ALKO_PRODUCTS.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    option.innerText = product.name;
    select.appendChild(option);
  });

  app.appendChild(div);
}

export async function createMap(
  appId: string,
  mapId: string,
  googleApiKey: string
): Promise<google.maps.Map> {
  const app = document.querySelector<HTMLDivElement>(`#${appId}`)!

  addMapElement(app, mapId)
  addProductSelector(app)

  const loader = new Loader(googleApiKey, { version: "weekly" });
  await loader.load();

  return new google.maps.Map(document.getElementById(mapId) as HTMLElement, {
    center: { lat: 60.1707368, lng: 24.9347073 },
    zoom: 10,
  });
}

export function initInfoWindow(): google.maps.InfoWindow {
  return new google.maps.InfoWindow();
}

export function setInfowindow(
  map: google.maps.Map,
  marker: google.maps.Marker,
  infoWindow: google.maps.InfoWindow,
  store: StoreAmount
): void {
  const amount =
    store.min === store.max ? store.min : `${store.min}-${store.max}`;
  infoWindow.close();
  infoWindow.setContent(`${getStoreName(store.id)} ${amount}`);
  infoWindow.open(map, marker);
}

export async function initMarkers(
  map: google.maps.Map,
  infoWindow: google.maps.InfoWindow,
  url: string
): Promise<MarkerStorage> {
  let newMarkers: MarkerStorage = {}
  const storeAmounts = await fetchAmounts(url)

  COORDINATES.forEach((store) => {
    const fetchedStore = storeAmounts.find((s) => s.id === store.id)
    const marker = new google.maps.Marker({
      map: map,
      icon: fetchedStore ? getIcon(fetchedStore) : undefined,
    })
    if (store.latitude) marker.setPosition(new google.maps.LatLng(
      store.latitude,
      store.longitude,
    ))

    newMarkers[store.id] = marker
    if (!fetchedStore) return

    marker.addListener("click", () => {
      setInfowindow(map, marker, infoWindow, fetchedStore)  
    })
  })

  return newMarkers;
}

async function setMarkers(
  map: google.maps.Map,
  infoWindow: google.maps.InfoWindow,
  markers: MarkerStorage,
  url: string
): Promise<void> {
  const storeAmounts = await fetchAmounts(url)

  console.log(storeAmounts.find((s) => s.id === "2702"))

  storeAmounts.forEach((store) => {
    const marker = markers[store.id]
    marker.setIcon(getIcon(store)),
      marker.addListener("click", () => {
        setInfowindow(map, marker, infoWindow, store);
      });
  });
}

export function addProductSelectorOnChange(
  map: google.maps.Map,
  infoWindow: google.maps.InfoWindow,
  markers: MarkerStorage,
  url: string
): void {
  const select: HTMLSelectElement | null = <HTMLSelectElement>(
    document.getElementById(SELECT_ID)
  );

  select.onchange = async () => {
    infoWindow.close();
    await setMarkers(map, infoWindow, markers, `${url}/${select.value}`);
  };
}
