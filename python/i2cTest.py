import smbus

channel = 1
address = 0x21

register = 0x03

bus = smbus.SMBus(channel)

# lights on
#msg = [0x9F]
#lights off
msg = [0x80]

bus.write_i2c_block_data(address, register, msg)
