from tkinter import *
import random

root = Tk()
root.title('Codmy.com - Software Registration Key Generator')
root.geometry("500x500")

def verify(key):
    global score
    score = 0

    check_digit = key[2]
    check_digit_count = 0

    chunks =  key.split('-')

    for chunk in chunks:
        if len(chunk) != 4:
            return False

        for char in chunk:
            if char == check_digit:
                check_digit_count += 1
            score += ord(char)

    if score > 1700 and score < 1800 and check_digit_count == 3:
        return True
    else:
        return False


#Generate Key
def generate():
    #Clear Key Label
    key_label.delete(0, END)
    verify_label.config(text="")

    key = ''
    section = ''
    check_digit_count = ''
    alphabet = 'abcdefghijklmnopqrstuvwxyz1234567890'

    while len(key) < 25:
        char = random.choice(alphabet)
        key += char
        section += char

        if len(section) == 4:
            key += '-'
            section = ''
    key = key[:-1]

    if verify(key):
        key_label.insert(0, key)
        verify_label.config(text="Valid!!")
        score_label.config(text=f"Score: {score}")
    else:
        generate()

    key_label.insert(0, key)



#Create a button
generate_button = Button(root, text="Generate Key", font=("Helvetica",32), command=generate)
generate_button.pack(pady=50)

key_label = Entry(root, font=("Helvetica", 24), bd=0, width=25)
key_label.pack(pady=10, padx=50)

#Verify Label
verify_label = Label(root, text="Waiting...", font=("Helvetica", 32))
verify_label.pack(pady=10)

score_label = Label(root, text='Score: ', font=("Helvetica", 32))
score_label.pack(pady=10)

root.mainloop()