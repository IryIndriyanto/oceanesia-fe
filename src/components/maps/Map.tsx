import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  ZoomControl,
  Tooltip,
} from 'react-leaflet'
import { icon, LatLng } from 'leaflet'
import useLocation from '@/hooks/useLocation'
import MapDrawer from './map-drawer/MapDrawer'
import {
  Button,
  IconButton,
  Portal,
  useColorModeValue,
  useDisclosure,
  Tooltip as ChakraTooltip,
} from '@chakra-ui/react'
import { ILocation } from '../../types/location'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import { useState } from 'react'

export default function Map() {
  let ButtonBg = useColorModeValue('white', 'navy.800')

  const ICON = icon({
    iconUrl: '/assets/location.png',
    iconSize: [30, 30],
  })
  const ICON_CLICKED = icon({
    iconUrl: '/assets/marker.png',
    iconSize: [35, 35],
  })

  const { locations } = useLocation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isLogin } = useUser()

  const [locationId, setLocationId] = useState(2)
  const [locationName, setLocationName] = useState('Select Location on Map')
  const [latitude, setLatitude] = useState(-6.1754)
  const [longitude, setLongitude] = useState(106.827)
  const [locationDescription, setLocationDescription] = useState(
    'No Description Yet.',
  )
  const [clickedMarkers, setClickedMarker] = useState<{
    [key: string]: boolean
  }>({})

  const getLocation = (location: ILocation) => {
    setLocationId(location.id)
    setLocationName(location.name)
    setLatitude(location.latitude)
    setLongitude(location.longitude)
    setLocationDescription(location.description)
  }

  const handleMarkerClick = (location: ILocation) => {
    onClose()
    setClickedMarker({})
    setClickedMarker((prevClickedMarkers) => ({
      ...prevClickedMarkers,
      [location.id]: true,
    }))
    getLocation(location)
    setTimeout(() => {
      onOpen()
    }, 300)
  }

  return (
    <>
      <MapContainer
        style={{ height: '100vh', zIndex: '0' }}
        center={[-6.1754, 106.827]}
        zoom={9}
        zoomControl={false}
      >
        <SearchedLocationMarker handleMarkerClick={handleMarkerClick} />
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations &&
          locations.length > 0 &&
          locations.map((location: ILocation) => (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={clickedMarkers[location.id] ? ICON_CLICKED : ICON}
              eventHandlers={{
                click: () => {
                  handleMarkerClick(location)
                },
              }}
            >
              <Tooltip>{location.name}</Tooltip>
            </Marker>
          ))}
        <Portal>
          {isLogin && <AddLocation />}
          <LocateUserPosition />
        </Portal>
      </MapContainer>
      <IconButton
        icon={<ChevronLeftIcon />}
        aria-label="Open drawer"
        bg={ButtonBg}
        onClick={onOpen}
        position="fixed"
        top={40}
        right={10}
      />
      <MapDrawer
        onClose={onClose}
        isOpen={isOpen}
        locationId={locationId}
        locationName={locationName}
        latitude={latitude}
        longitude={longitude}
        locationDescription={locationDescription}
        setClickedMarker={setClickedMarker}
      />
    </>
  )
}

import { useSearchedLocationStore } from '@/hooks/useSearchedLocationStore'
import { LatLngExpression } from 'leaflet'
import { useEffect } from 'react'
import AddLocation from './add-location/AddLocation'
import { IoMdLocate } from 'react-icons/io'
import useUser from '@/hooks/useUser'

function SearchedLocationMarker({ handleMarkerClick }: any) {
  const [position, setPosition] = useState<LatLngExpression | null>(null)
  const { SearchedLocation } = useSearchedLocationStore()
  const map = useMapEvents({})

  useEffect(() => {
    if (SearchedLocation) {
      setPosition([SearchedLocation.latitude, SearchedLocation.longitude])
      map.flyTo(
        [SearchedLocation.latitude, SearchedLocation.longitude],
        map.getZoom(),
      )
      handleMarkerClick(SearchedLocation)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SearchedLocation, map])

  return position === null ? null : <div />
}

function LocateUserPosition() {
  const ICON = icon({
    iconUrl: '/assets/user-location.png',
    iconSize: [30, 30],
  })
  let ButtonBg = useColorModeValue('white', 'navy.800')

  const [position, setPosition] = useState<LatLng | null>(null)
  const map = useMapEvents({
    locationfound(e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, 12)
    },
  })

  const handleLocateClick = () => {
    map.locate()
  }

  return (
    <>
      <ChakraTooltip placement="top" label="Locate">
        <Button
          bottom={'100px'}
          left={{ base: '30px', xl: '300px' }}
          position={'fixed'}
          onClick={handleLocateClick}
          w="45px"
          h="45px"
          p="8px"
          borderRadius="50%"
          bg={ButtonBg}
        >
          <IoMdLocate size={50} />
        </Button>
      </ChakraTooltip>

      {position === null ? null : (
        <Marker icon={ICON} position={position}>
          <Popup>You are here</Popup>
        </Marker>
      )}
    </>
  )
}
