import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import './SignUp.css';
import GoogleButton from 'react-google-button';
import { createTheme, ThemeProvider } from '@mui/material/styles';
const logoGradient = require('/client/src/img/logo-gradient.jpg');
const createReelImage = require('/client/src/components/ProfileSetUp/SignUpCont/CREATE_REEL.gif');
const mapsImage = require('/client/src/components/ProfileSetUp/SignUpCont/MAPS.gif');
const eventsImage = require('/client/src/components/ProfileSetUp/SignUpCont/EVENTS.gif');


const theme = createTheme({
  palette: {
    primary: {
      main: '#7161EF', // Customize the main color
    },
  },
});

const SignUp = () => {
  // Redirect user to sign up page
  const redirectToGoogleSSO = () => {
    window.location.href = `${process.env.HOST}/auth/login/google`;
  };

  const swiperRef = useRef(null);

  const progressCircle = useRef(null);
  const progressContent = useRef(null);
  const onAutoplayTimeLeft = (s: never, time: number, progress: number) => {
    progressCircle.current.style.setProperty('--progress', 1 - progress);
    progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
  };

  return (
    <ThemeProvider theme={theme}>
      <div className='container-sign-up'>
        <div className='flex-col'>
          <img
            src={logoGradient}
            alt='app logo'
            style={{ width: '200px', height: 'auto' }}
          />
        </div>
        <div className='flex-col'>
          <GoogleButton className='google-btn' onClick={redirectToGoogleSSO} />
        </div>
      <div className='swiper-parent'>
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{
            delay: 3750,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          onAutoplayTimeLeft={onAutoplayTimeLeft}
          className='mySwiper'
        >
          <SwiperSlide id='slide-1'>
            <h1>
              <span className='welcome'>WELCOME TO THE SPOT.</span> Discover
              Local Events. Connect with Friends.
            </h1>
          </SwiperSlide>
          <SwiperSlide id='slide-3'>
            <h1>CREATE REELS</h1>
            <div className='phone-screen' style={{ width: '205px', height: 'auto', boxShadow: '0px 8px 12px rgba(240, 244, 101, 0.8)' }}>
                <img
                  src={createReelImage}
                  alt='Create Reels'
                  className='phone-image'
                />
              </div>
          </SwiperSlide>
          <SwiperSlide id='slide-2'>
          </SwiperSlide>
          <SwiperSlide id='slide-3'>
            <h1>MAP OUT YOUR EVENING</h1>
            <div className='phone-screen' style={{ width: '205px', height: 'auto', boxShadow: '0px 8px 12px rgba(240, 244, 101, 0.8)' }}>
                <img
                  src={mapsImage}
                  alt='MAPS'
                  className='phone-image'
                />
              </div>
          </SwiperSlide>
          <SwiperSlide id='slide-4'>
          </SwiperSlide>
          <SwiperSlide id='slide-3'>
            <h1>PROMOTE LOCAL EVENTS</h1>
            <div className='phone-screen' style={{ width: '205px', height: 'auto', boxShadow: '0px 8px 12px rgba(240, 244, 101, 0.8)' }}>
                <img
                  src={eventsImage}
                  alt='EVENTS'
                  className='phone-image'
                />
              </div>
          </SwiperSlide>
          <div className='autoplay-progress' slot='container-end'>
            <svg viewBox='0 0 48 48' ref={progressCircle}>
              <circle cx='24' cy='24' r='20'></circle>
            </svg>
            <span ref={progressContent}></span>
          </div>
        </Swiper>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default SignUp;
