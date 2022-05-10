# Nano-Otzi: Cryo-Electron Tomography Visualization Guided by Learned Segmentations
This repository contains web-based volume rendering as presented in Nano-Oetzi paper.

## Deployment
The online demo is accessible at the link below.  
https://www.nanovis.org/nano-oetzi-webgpu/

**The current version was tested with Microsoft Edge Canary (Version: 102.0.1249.0 (Official build) canary (64-bit))**
The included demo data of ~ 160 MB in size might take some time to transfer and load.


## Data
The repository with segmentation code is available at the link below.  
https://github.com/nanovis/nano-oetzi

Other data is available in KAUST repository.  
https://repository.kaust.edu.sa/handle/10754/676709

Each `ts_16_predictions*.zip` archive containes files needed for individual visualization. In the demonstration application, you click on button "Select files from disk", select all the files from the archive and load them. Be aware that big volumes requre a lot of GPU memory. Full volume requires ~8GB of GPU memory.
