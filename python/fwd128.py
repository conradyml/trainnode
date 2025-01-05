import smbus

channel = 1
address = 0x21

register = 0x00

bus = smbus.SMBus(channel)

#128 speed command.
# 1st byte: CCCG GGGG is  0011 1111 for "128 Bit Speed Control" - = 0x3F
# 2nd byte: DSSS SSSS where D is 1 for FWD, O for reverse.
# byt of x000 0000 is stop.  x000 0001 is eStop


msg = [0x3F,0x0F]

bus.write_i2c_block_data(address, register, msg)
