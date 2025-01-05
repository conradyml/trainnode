import sys, getopt, smbus

def main(argv):
  reg = 0x00
  pld = []
  opts, args = getopt.getopt(argv,"hr:p:",["register=","payload="])
  for opt, arg in opts:
    if opt == '-h':
      print ('i2cTestSender.py -r <register> -p <payload>')
      sys.exit()
    elif opt in ("-r","--register"):
      reg = arg
    elif opt in ("-p","--payload"):
      pld = arg

  channel = 1
  address = 0x21
  bus = smbus.SMBus(channel)

  bus.write_i2c_block_data(address,reg,pld)

if __name__ == "__main__":
  main(sys.argv[1:])
