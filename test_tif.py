import requests

def get_weather_data(latitude, longitude, api_key):
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={api_key}&units=metric&lang=ar"
    response = requests.get(url)
    data = response.json()

    weather_details = {
        "location": data["name"],
        "coordinates": {
            "latitude": data["coord"]["lat"],
            "longitude": data["coord"]["lon"]
        },
        "weather": {
            "id": data["weather"][0]["id"],
            "main": data["weather"][0]["main"],
            "description": data["weather"][0]["description"],
            "icon": data["weather"][0]["icon"]
        },
        "temperature": {
            "current": data["main"]["temp"],
            "feels_like": data["main"]["feels_like"],
            "temp_min": data["main"]["temp_min"],
            "temp_max": data["main"]["temp_max"]
        },
        "pressure": data["main"]["pressure"],
        "humidity": data["main"]["humidity"],
        "visibility": data["visibility"],
        "wind": {
            "speed": data["wind"]["speed"],
            "direction": data["wind"]["deg"]
        },
        "cloudiness": data["clouds"]["all"],
        "time": data["dt"],
        "sys": {
            "sunrise": data["sys"]["sunrise"],
            "sunset": data["sys"]["sunset"],
            "country": data["sys"]["country"]
        },
        "timezone": data["timezone"]
    }

    return weather_details

latitude = 31.9633
longitude = 35.93
api_key = '6d12351278a6e0f3a7bdd70bd2ddbd24'
weather_data = get_weather_data(latitude, longitude, api_key)

# Print all weather details
print(weather_data)
