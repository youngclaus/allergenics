import React, { Component } from "react"
import "./map.css"
import { Map, InfoWindow, Marker, GoogleApiWrapper } from "google-maps-react"
import userIcon from "./marker.png"
const KEY = "AIzaSyD6ejzbYaV-cgiFO0V9a2yzs3ALSD3VZno"

const style = {
  width: "100%",
  height: "100%",
}

export class MapContainer extends Component {
  constructor(props) {
    // component state
    super(props)
    this.state = {
      userLocation: {
        lat: 0,
        lng: 0,
      },
    }
    // For testing purposes only
    this.uccPos = {
      lat: 40.74379,
      lng: -74.02507,
    }
  }

  calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return distance
  }

  deg2rad = (deg) => {
    return deg * (Math.PI / 180)
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position.coords.latitude, position.coords.longitude)
        const { latitude, longitude } = position.coords
        this.setState({
          userLocation: {
            lat: latitude,
            lng: longitude,
          },
        })
        // Change this from this.stuff to latitude, longitude for active user location
        this.searchNearbyRestaurants(latitude, longitude)
      },
      (error) => console.error(error)
    )
  }

  searchNearbyRestaurants(latitude, longitude) {
    const { google } = this.props
    const service = new google.maps.places.PlacesService(
      document.createElement("div")
    )
    const request = {
      location: { lat: latitude, lng: longitude },
      radius: "500",
      type: ["restaurant"],
    }
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        const restaurantsWithDistance = results.map((result) => {
          const distance = this.calculateDistance(
            latitude,
            longitude,
            result.geometry.location.lat(),
            result.geometry.location.lng()
          )
          return { ...result, distance: distance }
        })
        restaurantsWithDistance.sort((a, b) => {
          return a.distance - b.distance
        })
        this.props.onRestaurantsUpdate(restaurantsWithDistance)
        const restaurantIds = results.map((result) => result.place_id)
        console.log(restaurantIds)
      }
    })
  }

  onPlaceSelected = (place) => {
    if (place) {
      const { geometry } = place
      const { location } = geometry
      const { lat, lng } = location
      console.log(lat, lng)
      this.searchNearbyRestaurants(lat, lng)
      this.setState({
        userLocation: {
          lat,
          lng,
        },
      })
    }
  }

  collectRestaurantInfo = (results) => {
    const restaurants = results.map((result) => ({
      name: result.name,
      address: result.vicinity,
      rating: result.rating,
      id: result.place_id,
    }))
    console.log(restaurants)
    this.setState({
      restaurantsInfo: restaurants,
      restaurants: results,
    })
  }

  render() {
    return (
      <div>
        <Map
          containerStyle={style}
          google={this.props.google}
          initialCenter={this.state.userLocation}
          zoom={16}
          key={this.state.userLocation.lat + this.state.userLocation.lng}
          mapTypeControl={false}
        >
          <Marker
            position={this.state.userLocation}
            icon={{
              url: userIcon,
              scaledSize: new window.google.maps.Size(50, 50),
            }}
          />
          {this.props.restaurants &&
            this.props.restaurants.map((restaurant, index) => (
              <Marker key={index} position={restaurant.geometry.location} onClick={() => this.props.toggleCard(index)} />
            ))}
        </Map>
      </div>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: KEY,
})(MapContainer)
