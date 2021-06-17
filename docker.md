# Docker in Action Notes

## Chapter 1: Running sofware in containers:

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
The [docker logs](https://docs.docker.com/engine/reference/commandline/logs/) command will display the current logs of the specified container. "Anything that the program writes to the stdout or stderr output streams will be recorded in this log. The problem with this pattern is that the log is never rotated or truncated by default, so the data written to the log for a container will remain and grow as long as the container exists." DockerInAction Ch2

`docker logs web`
### Stop and restart containers      
The [docker stop](https://docs.docker.com/engine/reference/commandline/stop/) command will stop the specified container. 

`docker stop web`

The [docker restart](https://docs.docker.com/engine/reference/commandline/restart/) command will restart the specified container.

`docker restart web`

### Reattach a terminal to a container    
The [docker attach](https://docs.docker.com/engine/reference/commandline/attach/) command will attach local standard input, output, and error streams to a running container.

`docker attach web_test`
### Detach from an attached container
To stop a container, use CTRL-c. This key sequence sends SIGKILL to the container. If the container was run with -i and -t, you can detach from a container and leave it running using the CTRL-p CTRL-q key sequence.

### Isolating programs from each other and injecting configuration
"Every running program—or process—on a Linux machine has a unique number called a process identifier (PID). A PID namespace is a set of unique numbers that identify processes."

"Docker creates a new PID namespace for each container by default. A container’s PID namespace isolates processes in that container from processes in other containers."

"A user can pass input or provide additional configuration to a process in a container by specifying environment variables at container-creation time."

### Running multiple programs in a container 

### Durable containers and the container life cycle  
"Using the --read-only flag at container-creation time will mount the container filesystem as read-only and prevent specialization of the container."

"A container restart policy, set with the --restart flag at container-creation time, will help your systems automatically recover in the event of a failure."

### Cleaning up

## Chapter 3: Software and installation simplified![image](https://user-images.githubusercontent.com/1831568/122472404-8d6d7a80-cf8e-11eb-8210-2ac149fd487c.png)


