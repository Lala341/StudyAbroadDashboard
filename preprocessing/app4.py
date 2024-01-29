import pandas as pd

# Read the CSV file into a DataFrame
df = pd.read_csv('your_data.csv')

# Extract unique values from the 'country' column
unique_countries = df['country'].unique()

# Write the unique values to a text file
with open('unique_countries.txt', 'w') as file:
    for country in unique_countries:
        file.write(country + '\n')

print(df['total_score'].min())
print(df['total_score'].max())

print("Unique countries written to 'unique_countries.txt'")
