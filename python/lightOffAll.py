import smbus

channel = 1
address = 0x21

# register is the engine
# 0x00 is all
register = 0x00

bus = smbus.SMBus(channel)

#lights off
msg = [0x80]

bus.write_i2c_block_data(address, register, msg)
