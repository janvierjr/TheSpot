import './Map.css';
import React, { useState, useEffect, useRef } from 'react';
import GoogleMapReact from 'google-map-react';
import useSupercluster from 'use-supercluster';
import axios from 'axios';
import UserPin from './UserPin';
import UserClusterPin from './UserClusterPin';
import EventPin from './EventPin';
import EventClusterPin from './EventClusterPin';
import BusinessPin from './BusinessPin';
import BusinessClusterPin from './BusinessClusterPin'
import EventRadialMarker from './EventRadialMarker'
import { useLocation } from "react-router-dom";
import socketIOClient from 'socket.io-client';

type Props =  {
  loggedIn: {
    id: number;
    username: string;
    displayName: string;
    type: string;
    geolocation: string;
    mapIcon: string;
    birthday: string;
    privacy: string;
    accessibility: string;
    email: string;
    picture: string;
    googleId: string;
  }
  reelEvent: any;
}

type User = {
  id: number;
  geolocation: string;
}


const Map: React.FC<Props> = (props) => {
  const { loggedIn, reelEvent } = props;

  const [ renders, setRenders ] = useState(0)
  const [ users, setUsers ] = useState([]);
  const [ events, setEvents ] = useState([])
  const [ friendList, setFriendList ] = useState([]);
  const [ pendingFriendList, setPendingFriendList ] = useState([]);
  const [ businesses, setBusinesses ] = useState([]);


  // set up Socket.io connection
  const [socket, setSocket] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    const socket = socketIOClient(`${process.env.HOST}`);
    setSocket(socket);

    socket.on('connect', () => {
      setIsSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    return () => {
      socket.disconnect(); // clean up the socket connection on unmount
    };
  }, []);

  // listen for geolocation updates and update pins in real time
  useEffect(() => {
    if (isSocketConnected && socket) {
      socket.on('userGeolocationUpdate', (updatedUser: User) => {
        setUsers((prevUsers) =>
          prevUsers.map((user) => {
            if (user.id === updatedUser.id) {
              return {
                ...user,
                geolocation: updatedUser.geolocation,
              };
            }
            return user;
          })
        );
      });
    }
  }, [socket, isSocketConnected, users]);

  // function to split coordinates into array so lat and lng can easily be destructured
  const splitCoords = (coords: string) => {
    const arr = coords.split(',');
    return arr;
  }

 // sets the coords to op map to
  const location = useLocation();
  let eventLocation;
  if (location.state) {
    eventLocation = location.state.reelEvent;
  }

  let defaultCenter;
  if (eventLocation) {
    const [lat, lng] = splitCoords(eventLocation);
    defaultCenter = {lat: +lat, lng: +lng}
  } else {
    const [lat, lng] = splitCoords(loggedIn.geolocation);
    defaultCenter = {lat: +lat, lng: +lng}
  }

  const [ center, setCenter ] = useState(defaultCenter);


  // gets users friends
  const getFriendList = () => {
    axios.get('/feed/friendlist')
      .then(({ data }) => {
        const friendsIds = data.reduce((acc: number[], user: any) => {
          acc.push(user.accepter_id);
          return acc;
        }, []);
        console.log(friendsIds);
        setFriendList(friendsIds)
      })
      .catch((err) => {
        console.error('Failed to get Friends:', err);
      });
  }

  // gets users pending friend requests
  const getPendingFriendList = () => {
    axios.get('/friends/pending')
      .then(({ data }) => {
        const pendingFriendsIds = data.reduce((acc: number[], user: any) => {
          acc.push(user.accepter_id);
          return acc;
        }, []);
        setPendingFriendList(pendingFriendsIds)
      })
      .catch((err) => {
        console.error('Failed to get pending Friends:', err);
      });
  }

  // get all users
  const getUsers = () => {
    axios.get('/users')
      .then((res) => {
        setUsers(res.data);

      })
      .catch((err) => {
        console.log('error getting users', err);
      });
  }


  // gets all events
  const getEvents = () => {
    axios.get('/events/all')
      .then(({ data }) => {
        setEvents(data)
      })
      .catch((err) => {
        console.error('Failed to get Events:', err);
      });
  }

  // gets all businesses
  const getBusinesses = () => {
    axios.get('/users/businesses')
      .then((res) => {
        setBusinesses(res.data);
      })
      .catch((err) => {
        console.log('error getting businesses for map: ', err);
      })
  }

  useEffect(() => {
    getUsers();
    getFriendList();
    getPendingFriendList();
    getEvents();
    getBusinesses();
  }, [])

  // track map boundaries and zoom level
  const mapRef = useRef();
  const [ zoom, setZoom ] = useState(15); // <== must match default zoom
  const [ bounds, setBounds ] = useState(null);

  // clustering points for user pins
  const userPoints = users.filter((user) => {
    if (user.id === loggedIn.id) {
    return true;
    } else if (user.privacy === 'private') {
      return false;
    } else if (user.privacy === 'friends only' && !friendList.includes(user.id)){
     return false;
    }
    else if (user.type === 'business') {
      return false
    } else {
      return true;
    }
  }).map((user) => {
    const [lat, lng] = splitCoords(user.geolocation);
    return {
      type: 'Feature',
      properties: {
        cluster: false,
        user: user,
      },
      geometry: { type: 'Point', coordinates: [+lng, +lat]},
    }
  })

  const { clusters: userClusters } = useSupercluster({
    points: userPoints,
    bounds,
    zoom,
    options: {
      radius: 75,
      maxZoom: 19,
    }
  })


  // clustering points for events pins
  const eventPoints = events.map((event) => {
    const [lat, lng] = splitCoords(event.geolocation);
    return {
      type: 'Feature',
      properties: {
        cluster: false,
        event: event,
      },
      geometry: { type: 'Point', coordinates: [+lng, +lat]},
    }
  })

  const { clusters: eventClusters, supercluster } = useSupercluster({
    points: eventPoints,
    bounds,
    zoom,
    options: {
      radius: 75,
      maxZoom: 19,
    }
  })


  // clustering points for business pins
  const businessPoints = businesses.map((business) => {
    const [lat, lng] = splitCoords(business.geolocation);
    return {
      type: 'Feature',
      properties: {
        cluster: false,
        business: business,
      },
      geometry: { type: 'Point', coordinates: [+lng, +lat]},
    }
  })

  const { clusters: businessClusters } = useSupercluster({
    points: businessPoints,
    bounds,
    zoom,
    options: {
      radius: 75,
      maxZoom: 19,
    }
  })

  const options = {
    // minZoom: 11,
    // maxZoom: 19,
    disableDefaultUI: true,
    styles: [
      { stylers: [{ 'saturation': 1 }, { 'gamma': 0.5 }, { 'lightness': 4 }, { 'visibility': 'on' }] },
      { featureType: "poi", stylers: [{ visibility: 'off' }] }
    ]
  }


  const closeAllPopUps = () => {
    const userPopUps = document.getElementsByClassName('userPopUp');
    const eventPopUps = document.getElementsByClassName('eventPopUp');
    const busPopUps = document.getElementsByClassName('businessPopUp');

    Array.prototype.forEach.call( userPopUps, (popUp: any) => {
      popUp.style.display = 'none';
    })

    Array.prototype.forEach.call( eventPopUps, (popUp: any) => {
      popUp.style.display = 'none';
    })

    Array.prototype.forEach.call( busPopUps, (popUp: any) => {
      popUp.style.display = 'none';
    })
  }



  if (!users.length || !events.length || !businesses.length) {
    // Data is not yet available, render loading or placeholder content
    return <div>Loading...</div>;
  }

  return (
    <div className='mapParent' onWheel={closeAllPopUps}>
      <div className='mapChild'>
        <div id='map'>
          <GoogleMapReact
            bootstrapURLKeys={{ key: "AIzaSyAYtb7y6JZ2DxgdIESWJky8NyhWuu_YFVg" }}
            zoom={zoom}
            center={center}
            options={options}
            onDrag={closeAllPopUps}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map }) => {
              mapRef.current = map;
            }}
            onChange={({ zoom, bounds, center }) => {
              setCenter(center);
              setZoom(zoom);
              setBounds([
                bounds.nw.lng,
                bounds.se.lat,
                bounds.se.lng,
                bounds.nw.lat
              ])
            }}
          >
          {
            userClusters.map((cluster: any, i: number) => {
              const [ lng, lat ] = cluster.geometry.coordinates;
              const { cluster: isCluster, point_count: pointCount, user} = cluster.properties;

              if (isCluster) {
                return <UserClusterPin amount={pointCount} key={'userCluster' + i} lat={lat} lng={lng}/>;
              } else {
                return <UserPin
                  getPendingFriendList={getPendingFriendList}
                  pendingFriendList={pendingFriendList}
                  getFriendList={getFriendList}
                  friendList={friendList}
                  user={user}
                  key={'user' + i}
                  lat={lat}
                  lng={lng}
                  loggedIn={loggedIn}
                  setZoom={setZoom}
                  setCenter={setCenter}
                  closeAllPopUps={closeAllPopUps}
                  zoom={zoom}
                />;
              }
            })
          }
          {
            businessClusters.map((cluster: any, i: number) => {
              const [ lng, lat ] = cluster.geometry.coordinates;
              const { cluster: isCluster, point_count: pointCount, business} = cluster.properties;

              if (isCluster) {
                return <BusinessClusterPin amount={pointCount} key={'eventCluster' + i} lat={lat} lng={lng} />;
              } else {
                return <BusinessPin
                business={business}
                key={'business' + i}
                lat={lat}
                lng={lng}
                setZoom={setZoom}
                setCenter={setCenter}
                closeAllPopUps={closeAllPopUps}
                zoom={zoom}
              />;
              }
            })
          }
          {
            eventClusters.map((cluster: any, i: number) => {
              const [ lng, lat ] = cluster.geometry.coordinates;
              const { cluster: isCluster, point_count: pointCount, event} = cluster.properties;

              if (isCluster) {
                return <EventClusterPin amount={pointCount} key={'eventCluster' + i} lat={lat} lng={lng} onClick={() => {
                  const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(cluster.id), 20)
                  setZoom(expansionZoom);
                  setCenter({lat: lat, lng: lng});
                }} />;
              } else if (!isCluster && zoom >= 16) {
                return <EventRadialMarker zoom={zoom} key={'eventRadialMarker' + i} lat={lat} lng={lng} />
              } else {
                return <EventPin
                  event={event}
                  lat={+lat}
                  lng={+lng}
                  key={'event' + i}
                  setZoom={setZoom}
                  setCenter={setCenter}
                  closeAllPopUps={closeAllPopUps}
                  zoom={zoom}
                />
              }
            })
          }
          </GoogleMapReact>
        </div>
        <div className='legend'>
          <div className='userKey'></div><div className='userKeyText'> USERS </div>
          <div className='eventKey'></div><div className='eventKeyText'> EVENTS </div>
          <div className='businessKey'></div><div className='businessKeyText'> BUSINESSES </div>
          <div className='recenterButton' onClick={ () => {
            const [lat, lng] = splitCoords(loggedIn.geolocation);
            setZoom(15);
            setCenter({ lat: +lat, lng: +lng});
            }
          } > RECENTER </div>
        </div>
      </div>
    </div>

  );
};

export default Map;
