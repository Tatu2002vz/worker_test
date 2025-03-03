#! /bin/bash

# Kiểm tra quyền root
user_id=`id -u`
if [[ $user_id -ne 0 ]]; then
  echo "Use administrator rights to execute the tool."
  exit -1
fi

# Phát hiện hệ điều hành và cài đặt Node.js, npm và g++
if [[ -n $(find /etc -name "redhat-release") ]] || grep </proc/version -q -i "centos"; then
  yum install -y epel-release
  yum install -y gcc-c++ curl
elif grep </etc/issue -q -i "debian" && [[ -f "/etc/issue" ]] || grep </proc/version -q -i "debian"; then
  apt update -y
  apt install -y g++ curl
elif grep </etc/issue -q -i "ubuntu" && [[ -f "/etc/issue" ]] || grep </proc/version -q -i "ubuntu"; then
  apt update -y
  apt install -y g++ curl
else
  echo "Unsupported operating system."
  exit -1
fi

# Cài đặt Nodejs và npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt update -y
sudo apt install nodejs -y

# Chạy npm install và npm install -g pm2
npm install
npm install -g pm2

# Kiểm tra nếu pm2 đã được cài đặt thành công
pm2_status=$(pm2 --version)
if [[ $? -eq 0 ]]; then
  echo "Install and setup success!"
  exit 0
else
  echo "Install and setup failed!"
  exit -1
fi
