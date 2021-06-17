# Docker Education

## Basic Docker operations and commands:

### Create detached and interactive containers   

The following command runs a container with the latest nginx as a daemon background service. 

`docker run --detach --name web nginx:latest`

The following command runs a busybox container with the standard input stream open (stdin), with the --interactive option, and creates a virtual terminal, with the --tty option.

`docker run --interactive --tty --link web:web --name web_test busybox:1.29 /bin/sh`
Note: to exit the interactive terminal use: CTRL P then Q

What is [Busybox](https://hub.docker.com/_/busybox)? "The Swiss Army Knife of Embedded Linux"
[nginx](https://hub.docker.com/_/nginx) is a popular web server

### List containers on your system
The [docker ps](https://docs.docker.com/engine/reference/commandline/ps/) command will list currently running containers on the system

`docker ps`



### View container logs    

`$ docker logs web
/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
/docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
/docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
10-listen-on-ipv6-by-default.sh: info: Enabled listen on IPv6 in /etc/nginx/conf.d/default.conf
/docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
/docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
/docker-entrypoint.sh: Configuration complete; ready for start up
2021/06/17 01:15:59 [notice] 1#1: using the "epoll" event method
2021/06/17 01:15:59 [notice] 1#1: nginx/1.21.0
2021/06/17 01:15:59 [notice] 1#1: built by gcc 8.3.0 (Debian 8.3.0-6)
2021/06/17 01:15:59 [notice] 1#1: OS: Linux 5.10.25-linuxkit
2021/06/17 01:15:59 [notice] 1#1: getrlimit(RLIMIT_NOFILE): 1048576:1048576
2021/06/17 01:15:59 [notice] 1#1: start worker processes
2021/06/17 01:15:59 [notice] 1#1: start worker process 31
2021/06/17 01:15:59 [notice] 1#1: start worker process 32
172.17.0.5 - - [17/Jun/2021:01:17:14 +0000] "GET / HTTP/1.1" 200 612 "-" "Wget" "-"
`
### Stop and restart containers                  
### Reattach a terminal to a container                  
### Detach from an attached container

### Isolating programs from each other and injecting configuration

### Running multiple programs in a container 

### Durable containers and the container life cycle  

### Cleaning up

