import pandas as pd

# Read the CSV file into a DataFrame
df = pd.read_csv('data_with_coordinates.csv')

# List of European countries
european_countries = [
    'United Kingdom', 'Switzerland', 'Sweden', 'Germany', 'Belgium', 'Netherlands',
    'France', 'Finland', 'Denmark', 'Italy', 'Norway', 'Austria', 'Spain',
    'Republic of Ireland', 'Russia', 'Iceland', 'Luxembourg', 'Czech Republic',
    'Greece', 'Cyprus', 'Portugal', 'Estonia', 'Slovenia', 'Hungary', 'Poland',
    'Serbia', 'Slovakia', 'Latvia', 'Lithuania'
]

# Filter the dataset for European countries
filtered_df = df[df['country'].isin(european_countries)].copy()

# Add the 'country-iso' column with ISO-3 representation
iso_mapping = {
    'United Kingdom': 'GBR',
    'Switzerland': 'CHE',
    'Sweden': 'SWE',
    'Germany': 'DEU',
    'Belgium': 'BEL',
    'Netherlands': 'NLD',
    'France': 'FRA',
    'Finland': 'FIN',
    'Denmark': 'DNK',
    'Italy': 'ITA',
    'Norway': 'NOR',
    'Austria': 'AUT',
    'Spain': 'ESP',
    'Republic of Ireland': 'IRL',
    'Russia': 'RUS',
    'Iceland': 'ISL',
    'Luxembourg': 'LUX',
    'Czech Republic': 'CZE',
    'Greece': 'GRC',
    'Cyprus': 'CYP',
    'Portugal': 'PRT',
    'Estonia': 'EST',
    'Slovenia': 'SVN',
    'Hungary': 'HUN',
    'Poland': 'POL',
    'Serbia': 'SRB',
    'Slovakia': 'SVK',
    'Latvia': 'LVA',
    'Lithuania': 'LTU'
}

filtered_df['country-iso'] = filtered_df['country'].map(iso_mapping)

# Save the filtered dataset to a new CSV file
filtered_df.to_csv('finalnewdata.csv', index=False)

print("Filtered dataset saved to 'data2.csv'")
