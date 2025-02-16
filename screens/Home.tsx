import { StatusBar } from 'expo-status-bar';
import { View, Image, SafeAreaView, TextInput, TouchableOpacity, Text, ScrollView } from 'react-native';
import "../global.css";
import { theme } from '../theme';
import { MagnifyingGlassIcon, ClockIcon, ChevronDoubleRightIcon } from 'react-native-heroicons/outline'
import { CalendarDaysIcon, MapPinIcon } from 'react-native-heroicons/solid'
import { useCallback, useEffect, useState } from 'react';
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import { weatherImages } from '../constants';
import * as Progress from 'react-native-progress'
import { getStoredData, storeData } from '../utils/asyncStorage';


export default function Home() {
  var _ = require('lodash');
  const [showSearch, setShowSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [weatherForHour, setWeatherForHour] = useState<any>();

  // select location get weather data
  const handleLocation = (loc: any) => {
    setLocations([]);
    setShowSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: "7"
    }).then((data) => {
      setWeather(data);
      setLoading(false);
      storeData("city", loc.name);
    }
    );
    fetchWeatherForecast({
      cityName: loc.name,
      days: "1"
    }).then((data) => {
      setWeatherForHour(data);
      setLoading(false);
    }
    );
    return;
  }

  // search locations
  const handleSearch = (value: any) => {
    setShowSearch(true);
    if (value.length > 2) {
      fetchLocations({
        cityName: value
      }).then(data => {
        setLocations(data);
      });
    }
    return;
  }

  const handleTextDebounce = useCallback(_.debounce(handleSearch, 1200), []);

  useEffect(() => {
    getDefaultCityData();
  }, []);

  // get default city data
  const getDefaultCityData = async () => {
    setLoading(true);
    let defaultCity = await getStoredData("city");
    let cityName = "Ankara";
    if (defaultCity) {
      cityName = defaultCity;
    }
    fetchWeatherForecast({
      cityName: cityName,
      days: "7"
    }).then((data) => {
      setWeather(data);
      setLoading(false);
    }
    );
    fetchWeatherForecast({
      cityName: cityName,
      days: "1"
    }).then((data) => {
      setWeatherForHour(data);
      console.log(JSON.stringify(data));
      setLoading(false);
    }
    );
    return;
  }

  return (
    <View className='flex-1 relative'>
      <StatusBar style='light' />
      <Image
        blurRadius={70}
        source={require('../assets/images/bg-dark.jpeg')}
        className='absolute w-full h-full' />
      {
        loading && (
          <View className='flex-1 flex-row justify-center items-center'>
            <Progress.CircleSnail thickness={10} size={100} color={"#0bb3b2"} />
          </View>
        ) || (
          <SafeAreaView
            className='flex flex-1'>
            {/* SEARCH SEECTION */}
            <View
              style={{ height: "7%" }}
              className='mx-4 my-2 relative z-50'>
              <View
                className='flex-row justify-end items-center rounded-full'
                style={{ backgroundColor: showSearch ? theme.bgWhite(0.2) : "transparent" }}>
                {
                  showSearch && (
                    <TextInput
                      onChangeText={handleTextDebounce}
                      placeholder='Search City'
                      className='pl-6 pb-1 h-10 flex-1 text-base text-white'
                      placeholderTextColor={'lightgray'} />
                  )
                }
                <TouchableOpacity
                  style={{ backgroundColor: theme.bgWhite(0.3) }}
                  className='rounded-full p-3 m-1'>
                  <MagnifyingGlassIcon
                    size={25}
                    color={"white"}
                    onPress={() => setShowSearch(!showSearch)}
                  />
                </TouchableOpacity>
              </View>
              {
                (locations.length > 0 && showSearch) && (
                  <View className='absolute w-full bg-gray-300 top-16 rounded-3xl'>
                    {
                      locations.map((loc: any, index) => {
                        let showBorder = index + 1 != locations.length;
                        let borderClass = showBorder ? 'border-b-2 border-b-gray-400' : '';
                        return (<TouchableOpacity
                          onPress={() => handleLocation(loc)}
                          key={index}
                          className={'flex-row items-center border-0 p-3 px-4 mb-1 ' + borderClass}
                        >
                          <MapPinIcon size={20} color={'gray'} />
                          <Text className='text-black text-lg ml-2'>{loc?.name}, {loc?.country}</Text>
                        </TouchableOpacity>)
                      })
                    }
                  </View>
                )
              }
            </View>
            <ScrollView className='flex w-full h-full'>
              {/* FORECAST SECTION */}
              <View className='flex flex-col mt-16'>
                <View className='flex-1'>
                  {/* TODAY MAIN */}
                  <Text className='text-white text-center text-4xl font-bold mb-24'>
                    {" " + weather?.location?.name},
                    <Text className='text-lg font-semibold text-gray-300'>{weather?.location?.country}</Text>
                  </Text>
                </View>
                <View className='flex-1'>
                  <View className='flex-row justify-center'>
                    <Image
                      //source={{uri: "https:" + weather?.current.condition?.icon}}   // api icon is bad. use custom icon
                      source={weatherImages[weather?.current?.condition?.text.trim()]}
                      className='w-52 h-52' />
                  </View>
                  <View className='space-y-2 mt-16'>
                    <Text className='text-center font-bold text-white text-6xl ml-5'>{weather?.current.temp_c}&#176;</Text>
                    <Text className='text-center text-white text-xl tracking-widest'>{weather?.current.condition?.text}</Text>
                  </View>
                </View>
                <View className='flex-1'>
                  {/* TODAY SUMMARY */}
                  <View className='flex-row justify-between mx-12 mt-16'>
                    <View className='flex-row space-x-2 items-center'>
                      <Image
                        source={require('../assets/icons/wind.png')}
                        className='w-6 h-6' />
                      <Text className='text-white font-semibold text-base ml-2'>
                        {weather?.current?.wind_kph}km
                      </Text>
                    </View>
                    <View className='flex-row space-x-2 items-center'>
                      <Image
                        source={require('../assets/icons/drop.png')}
                        className='w-6 h-6' />
                      <Text className='text-white font-semibold text-base ml-2'>
                        {weather?.current?.humidity}%
                      </Text>
                    </View>
                    <View className='flex-row space-x-2 items-center'>
                      <Image
                        source={require('../assets/icons/sun.png')}
                        className='w-6 h-6' />
                      <Text className='text-white font-semibold text-base ml-2'>
                        {weather?.forecast?.forecastday[0].astro?.sunrise}
                      </Text>
                    </View>
                  </View>
                </View>
                <View className='flex-1'>
                  {/* NEXT DAYS SECTION */}
                  <View className='mt-12'>
                    <View className='flex-row items-center mx-5 space-x-2'>
                      <CalendarDaysIcon size={22} color={"white"} />
                      <Text className='text-white text-base ml-2'>Daily Forecast</Text>
                    </View>
                    <ScrollView
                      horizontal
                      contentContainerStyle={{ paddingHorizontal: 15 }}
                      showsHorizontalScrollIndicator={false}>
                      {
                        weather?.forecast?.forecastday?.map((item: any, index: any) => {
                          let date = new Date(item.date);
                          let options: any = { weekday: 'long' };
                          let dayName = date.toLocaleDateString('en-US', options);
                          return (
                            <View
                              key={index}
                              className='flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4 mt-2'
                              style={{ backgroundColor: theme.bgWhite(0.15) }}>
                              <Image
                                //source={require('../assets/images/heavyrain.png')}
                                source={weatherImages[item?.day?.condition?.text.trim()]}
                                className='w-11 h-11' />
                              <Text className='text-white'>
                                {dayName}
                              </Text>
                              <Text className='text-white text-xl font-semibold'>
                                {item?.day?.avgtemp_c}&#176;
                              </Text>
                            </View>
                          )
                        })
                      }
                    </ScrollView>
                  </View>
                </View>
                <View className='flex-1'>
                  <View className='mt-12'>
                    <View className='flex-row items-center mx-5 space-x-2'>
                      <ClockIcon size={22} color={"white"} />
                      <Text className='text-white text-base ml-2'>Hourly Forecast</Text>
                    </View>
                    <ScrollView className='h-72'>
                    {
                      weatherForHour?.forecast?.forecastday[0].hour.map((item:any, index:any) => {
                        let date = new Date(item.time);
                        let hourText = date.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        return (
                          <View key={index} className='flex-row mt-4 mx-5 rounded-lg h-10' style={{ backgroundColor: theme.bgWhite(0.1) }}>
                            <Text className='w-1/4 text-center text-white text-xl my-2'>                            
                              {hourText}
                            </Text>
                            <Text className='w-1/4 text-center text-white text-xl my-2'>
                              {item.temp_c}&#176;
                            </Text>
                            <Text className='w-2/4 text-center text-white text-xl my-2'>
                              {item.condition.text}
                            </Text>
                          </View>
                        );
                      })
                    }
                    </ScrollView>
                    
                  </View>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        )
      }
    </View>
  );
}