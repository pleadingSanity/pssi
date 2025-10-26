import { Request, Response } from 'express';
import si from 'systeminformation';

export async function getSystemStats(_req: Request, res: Response) {
  try {
    const [cpu, mem, osInfo, disk, network] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.fsSize(),
      si.networkStats(),
    ]);

    const stats = {
      timestamp: new Date().toISOString(),
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        speed: cpu.speed,
      },
      memory: {
        total: mem.total,
        free: mem.free,
        used: mem.used,
        percentage: ((mem.used / mem.total) * 100).toFixed(2),
      },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch,
      },
      disk: disk.map(d => ({
        fs: d.fs,
        type: d.type,
        size: d.size,
        used: d.used,
        available: d.available,
        percentage: d.use,
      })),
      network: network.map(n => ({
        iface: n.iface,
        rx_bytes: n.rx_bytes,
        tx_bytes: n.tx_bytes,
      })),
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ error: 'Failed to fetch system stats' });
  }
}
