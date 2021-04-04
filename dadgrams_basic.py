import random
import time
import requests

### GLOBALS

# each line is a single word

LOCAL_WORDS_PATH = '/usr/share/dict/words'
ONLINE_WORD_PATH = 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt'
try:
    WORDS = [w.strip().upper() for w in requests.get(ONLINE_WORD_PATH).text.split('\r')]
    WORDS_PATH = ONLINE_WORD_PATH
except:
    with open(LOCAL_WORDS_PATH) as f:
        # valid words are 3 letters or greater
        WORDS = list(set([line.strip().upper() for line in f if len(line.strip()) >=3 ]))
        WORDS_PATH = LOCAL_WORDS_PATH

# pangrams are all words with 7 distinct letters
PANGRAMS = [w for w in WORDS if len(set(w)) == 7]



MENU = """
====================================================================================
Title: dadgrams.py
Description: Use the letterset provided to guess as many words as possible including one that uses all the letters!
                All words must use the center letter of the charset.

Menu Options:
    `play`:     start a new game
    `quit`:     quit the application

How To Play:
    Type "play" to start a new game. 
    A set of letters will be presented to you along with a key "center" letter.
    Type a word using only those letters and that contains the center letter.
    type "show score" to show the words you've gotten so far.
    
    Get as may words as you can!

In Game Options:
    `main menu`: exit current game and go to main menu
    `show score`: show the words you've gotten so far in current game.


====================================================================================


"""


def new_game():
    # random pangram choice
    pangram = random.choice(PANGRAMS)
    charset = list(set(pangram))
    random.shuffle(charset)

    center = random.choice(charset)
    # valid words are all words that contain the "center" letter and are composed only of letters in charset
    valid_words = [word for word in WORDS if center in word and all([w in charset for w in word])] # center in word and 

    return {'charset': charset, 
            'center' :center, 
            'words': valid_words,
            'pangram': pangram, # technically there can be others?
            'max_score': sum([len(w) for w in valid_words]) + len(pangram), # pangram is worth double
            'score': []
           }


def show_score(game):
    total = 0
    for word, points in game['score']:
        print(word, ':', points, 'points')
        total += points
    print("Total Words:", len(game['score']))
    print("Total Points:", total)


def show_game(game):
    print('Letters:', ' '.join(game['charset']))
    print('Center:', '  ', game['center'])
    print()
    print('Max Possible Score:', game['max_score'])
    print()
    print()


def play():
    print('--------------------------------------')
    print()

    game = new_game()
    # breakpoint()
    while True:
        show_game(game)
        inpt = str(input('Enter Word: ')).upper()
        print()
        if inpt in ('MAIN MENU', 'MM'):
            return
        elif inpt in ('SHOW SCORE', 'SS'):
            show_score(game)
        elif inpt in [w for w,s in game['score']]:
            print('You already found that word!')
        elif inpt == game['pangram']:
            print('You found the pangram!')
            print(inpt, 'is worth', len(game['pangram'])*2, 'points')
            game['score'].append((inpt, len(inpt)*2))
        elif inpt in game['words']:
            print(inpt, 'is worth', len(inpt), 'points')
            game['score'].append((inpt, len(inpt)))
        else:
            print(inpt, 'is not a valid word')
        
        if inpt == 'BP':
            breakpoint()
    
        print('--------------------------------------')
        print()
        time.sleep(1.25)


def show_menu():
    print(MENU)
    while True:
        action = input('What would you like to do? ')
        if action in ('p', 'play'):
            play()
        elif action in ('q', 'quit'):
            print('Goodbye!')
            break
        else:
            print('{} not understood'.format(action))
            print()


if __name__ == '__main__':
    show_menu()
    