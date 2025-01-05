import smbus
import time

channel = 1
address = 0x21

# register is the address of the engine / decoder.
# 0x00 is "broadcast" - to all decoder.
register = 0x00

bus = smbus.SMBus(channel)

#Command 0000 0001 is hard reset
#Command 0000 0000 is reset.

stopMsg = [0x40]
resetMsg = [0x00]
hardReset = [0x01]

PagePresetAdr = 0x7D
PagePresetMsg = [0x01]

AddressSetAdr = 0x78
# Data is the new address. 0DDD DDDD
AddressSetData = [0x05]


# Power-On-Cycle - 20 valid packets.
print("POC: ", end="")
for i in range(20):
  bus.write_i2c_block_data(address, register, stopMsg)
  print( i, end=",")
print("")

# 3 or more reset packets  
print("Reset Packets:",end="") 
for j in range(3):
  bus.write_i2c_block_data(address, register, resetMsg)
  print( j, end=",")
print("")

# 5 or more page preset packets  
print("page Preset Packets:",end="") 
for k in range(6):
  bus.write_i2c_block_data(address, PagePresetAdr, PagePresetMsg)
  print( k, end=",")
print("")

# 9 or more reset packets  
print("Reset Packets:",end="") 
for j in range(10):
  bus.write_i2c_block_data(address, register, resetMsg)
  print( j, end=",")
print("")

# 10 or more write packets  
print("Write packets:",end="") 
for j in range(10):
  bus.write_i2c_block_data(address, AddressSetAdr, AddressSetData)
  print( j, end=",")
print("")

# 5 or more reset packets  
print("Reset Packets:",end="") 
for j in range(5):
  bus.write_i2c_block_data(address, register, resetMsg)
  print( j, end=",")
print("")

