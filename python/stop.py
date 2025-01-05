import smbus

channel = 1
address = 0x21

register = 0x03

bus = smbus.SMBus(channel)

#stop
msg = [0x40]

bus.write_i2c_block_data(address, register, msg)
