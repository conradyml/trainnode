import smbus

channel = 1
address = 0x21

register = 0x03

bus = smbus.SMBus(channel)

#Full Forward
msg = [0x6F]

bus.write_i2c_block_data(address, register, msg)
