from flask import Flask, jsonify, request
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import random
from difflib import SequenceMatcher
from datetime import datetime


app = Flask(__name__)

# Set up the Spotify API credentials
client_id = 'b822bfa6e75b4eb1a785ccf4d7af747f'
client_secret = '024d2f67a3bc41518d60e5f0e8dc096a'
redirect_uri = 'http://localhost:8888/callback'
scopes = "user-read-playback-state,user-modify-playback-state,streaming"
current_track = None
current_artist = None
players = []
game_code = None
new_song_playing = False
times_run = 0
access_count = 0
song_start_time = None



# Create a Spotify API client
# Create a Spotify API client with the necessary scopes
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=client_id,
                                               client_secret=client_secret,
                                               redirect_uri=redirect_uri,
                                               scope=scopes))

# Get the playlist ID
playlist_id = '4g53onSOsSmpakrqL9tXMd'

# Initialize an empty list to store all tracks
all_tracks = []

def fetch_playlist_tracks():
    global all_tracks
    try:
        # Initial call to fetch the first set of tracks
        results = sp.playlist_tracks(playlist_id)
        all_tracks.extend(results['items'])

        # Continue fetching tracks until all have been retrieved
        while results['next']:
            results = sp.playlist_tracks(playlist_id, offset=len(all_tracks))
            all_tracks.extend(results['items'])
    except spotipy.exceptions.SpotifyException as e:
        print(f"Spotify API error: {e}")
        # Handle error (e.g., attempt to refresh token, log error, etc.)

fetch_playlist_tracks()

@app.route('/play')
def play():
    random_track = random.choice(all_tracks)
    track_name = random_track['track']['name']
    track_uri = random_track['track']['uri']

    global current_track, current_artist, song_start_time

    song_start_time = datetime.now()
    current_track = track_name
    current_artist = random_track['track']['artists'][0]['name']

    print(track_name, current_artist)
    sp.start_playback(uris=[track_uri])

    return f"Now playing: {current_artist} - {current_track}"

@app.route('/check_guess', methods=['POST'])
def check_guess():
    data = request.get_json()
    guess_artist_for_display = data['artist']
    guess_song_for_display = data['song']
    guess_artist = data['artist'].lower()
    guess_song = data['song'].lower()
    username = data['username']

    for player in players:
        if player['name'] == username:
            player['current_track_guess'] = guess_song_for_display
            player['current_artist_guess'] = guess_artist_for_display

    lower_artist = current_artist.lower()
    lower_song = current_track.split(' (')[0].lower()

    global song_start_time
    guess_time = datetime.now()  # Time of the guess
    time_taken = (guess_time - song_start_time).total_seconds()  # Time taken in seconds

    print(time_taken)

    # Define a similarity threshold
    similarity_threshold = 0.8  # 80% similarity

    # Function to calculate similarity
    def similarity(a, b):
        return SequenceMatcher(None, a, b).ratio()

    # Calculate similarities
    artist_similarity = similarity(guess_artist, lower_artist)
    song_similarity = similarity(guess_song, lower_song)

    # Check if either artist or song guesses meet the similarity threshold
    artist_correct = artist_similarity >= similarity_threshold
    song_correct = song_similarity >= similarity_threshold
    # Example scoring adjustment based on time taken
    base_points = 1000  # Base points for a correct guess
    time_penalty = max(0, (time_taken - 10) * 10)  # Example penalty calculation

    # Adjust points based on time taken
    points_awarded = max(0, base_points - int(time_penalty))  # Ensure only integers are added

    if artist_correct and song_correct:
        # Increase the player's score based on time taken
        for player in players:
            if player['name'] == username:
                player['score'] += points_awarded
        return 'Correct guess!'
    elif artist_correct or song_correct:
        # Increase the player's score by half of the points for partially correct guess
        for player in players:
            if player['name'] == username:
                player['score'] += points_awarded // 2
        if artist_correct:
            return 'Artist correct!'
        else:
            return 'Title correct!'
    else:
        return 'Incorrect guess!'

@app.route('/players')
def get_players():
    print(players)
    return {'players': players}

@app.route('/add_player', methods=['POST'])
def add_player():
    data = request.get_json()
    name = data['name']
    # Generate a new unique ID
    new_id = max(player['id'] for player in players) + 1 if players else 1
    # Append the new player with a score of 0
    players.append({'id': new_id, 'name': name, 'score': 0, 'current_track_guess': None, 'current_artist_guess': None})
    print(players)
    return 'Player added!'

@app.route('/generate_code')
def generate_code():
    global current_track, current_artist, players, game_code, new_song_playing


    current_track = None
    current_artist = None
    players = []
    game_code = None
    new_song_playing = False

    game_code = random.randint(1000, 9999)
    print(game_code)
    return {'game_code': game_code}

@app.route('/check_game_code', methods=['GET'])
def check_game_code():
    gameCode = request.args.get('code', default=None, type=int)
    if gameCode is not None and gameCode == game_code:
        return {'isValidGameCode': True}
    else:
        return {'isValidGameCode': False}


@app.route('/nextpage')
def next_page():
    global new_song_playing, players, access_count
    connected_players = len(players)
    print(connected_players)

    if new_song_playing:
        # Increment the access count
        access_count += 1
        
        # Check if all connected players have accessed the endpoint
        if access_count >= connected_players:
            new_song_playing = False
            # Reset the counter for the next song
            access_count = 0
            return jsonify({'isPlaying': True})
        else:
            return jsonify({'isPlaying': True})
    return jsonify({'isPlaying': False})

@app.route('/setnextpage')
def set_next_page():
    global new_song_playing
    new_song_playing = True
    return 'Next page playing status set!'

@app.route('/answers')
def get_answers():
    global current_track, current_artist
    return {'song': current_track, 'artist': current_artist}

@app.route('/reset_guesses')
def reset_guesses():
    for player in players:
        player['current_track_guess'] = None
        player['current_artist_guess'] = None
    return 'Guesses reset!'


if __name__ == '__main__':
    app.run()