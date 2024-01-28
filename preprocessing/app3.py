import pandas as pd
import requests

# Read the CSV file into a DataFrame
df = pd.read_csv('your_data.csv')

# OpenCage Geocoding API key (replace with your actual key)
api_key = '0af8c9ac7fb04669ad54f1fc7ce51c99'

def get_lat_lng_by_name(university_name, country):
    # Construct the query
    query = f'{university_name}, {country}'

    # Make a request to the OpenCage Geocoding API
    response = requests.get(f'https://api.opencagedata.com/geocode/v1/json?q={query}&key={api_key}')

    # Parse the response
    result = response.json()

    # Check if the API request was successful
    if result['status']['code'] == 200 and result['results']:
        # Get the first result (most relevant)
        location = result['results'][0]['geometry']
        return location['lat'], location['lng']
    else:
        # If there was an error or no results, return None
        return None

# Add 'latitude' and 'longitude' columns to the DataFrame
df['latitude'] = None
df['longitude'] = None

# Iterate through rows and populate latitude and longitude columns
for index, row in df.iterrows():
    lat_lng = get_lat_lng_by_name(row['university_name'], row['country'])
    if lat_lng:
        df.at[index, 'latitude'] = lat_lng[0]
        df.at[index, 'longitude'] = lat_lng[1]

# Save the DataFrame with latitude and longitude to a new CSV file
df.to_csv('data_with_coordinates.csv', index=False)

print("Latitude and longitude added, and the data saved to 'data_with_coordinates.csv'")
