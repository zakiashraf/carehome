import random

# array = [0] * (24*365)
# for i in range(24*365):
#     array[i] = random.randint(25,100)
# print(array)

rawData = [82, 73, 46, 60, 100, 74, 66, 59, 63, 76, 26, 65, 36, 99, 94, 86, 41, 49, 72, 71, 42, 44, 54, 98]
data = [0] * 8
counter = 0
total = 0
for index in range(len(rawData)):
    element = rawData[index]
    counter += 1
    total += element
    if (counter % 3 == 0):
      counter = 0
      position = int((index+1)/3 - 1)
      print(position)
      data[position] = total
      total = 0
      
print(data)