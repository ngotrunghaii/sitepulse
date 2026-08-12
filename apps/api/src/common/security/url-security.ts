import { BadRequestException } from '@nestjs/common';

// ─── Danh sách hostname bị chặn tuyệt đối ────────────────────────────────────

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '169.254.169.254', // AWS/GCP/Azure instance metadata endpoint
]);

// ─── Helper: parse IPv4 sang số nguyên 32-bit ────────────────────────────────

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let result = 0;
  for (const part of parts) {
    const num = parseInt(part, 10);
    if (isNaN(num) || num < 0 || num > 255) return null;
    result = (result << 8) | num;
  }
  // >>> 0 để đảm bảo unsigned 32-bit
  return result >>> 0;
}

// ─── Helper: kiểm tra IP nằm trong CIDR ─────────────────────────────────────

function isInCidr(ip: string, cidr: string): boolean {
  const [base, prefixStr] = cidr.split('/');
  const prefixLen = parseInt(prefixStr, 10);

  const ipInt = ipv4ToInt(ip);
  const baseInt = ipv4ToInt(base);
  if (ipInt === null || baseInt === null) return false;

  const mask = prefixLen === 0 ? 0 : (~0 << (32 - prefixLen)) >>> 0;
  return (ipInt & mask) === (baseInt & mask);
}

// ─── Dải IP private cần chặn ─────────────────────────────────────────────────

const PRIVATE_CIDR_RANGES = [
  '10.0.0.0/8',      // Class A private
  '172.16.0.0/12',   // Class B private
  '192.168.0.0/16',  // Class C private
  '169.254.0.0/16',  // Link-local (bao gồm cả metadata 169.254.169.254)
  '127.0.0.0/8',     // Loopback toàn dải (không chỉ 127.0.0.1)
  '0.0.0.0/8',       // "This" network
  '100.64.0.0/10',   // Shared address space (RFC 6598)
  '192.0.0.0/24',    // IETF Protocol Assignments
  '198.18.0.0/15',   // Benchmarking (RFC 2544)
  '198.51.100.0/24', // Documentation (TEST-NET-2)
  '203.0.113.0/24',  // Documentation (TEST-NET-3)
  '240.0.0.0/4',     // Reserved (class E)
  '255.255.255.255/32', // Broadcast
];

// ─── Helper: kiểm tra hostname có phải IP private không ─────────────────────

function isPrivateIpv4(hostname: string): boolean {
  return PRIVATE_CIDR_RANGES.some((cidr) => isInCidr(hostname, cidr));
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Kiểm tra URL monitor có an toàn để server thực hiện HTTP request không.
 * Ném BadRequestException với message tiếng Việt nếu URL vi phạm.
 *
 * Các trường hợp bị chặn:
 * - Protocol không phải http: hoặc https:
 * - Hostname rỗng hoặc URL parse lỗi
 * - Có username/password trong URL (credential leakage risk)
 * - Hostname nằm trong danh sách chặn (localhost, loopback, metadata endpoint...)
 * - IP thuộc dải private/link-local/reserved (SSRF prevention)
 *
 * TODO (production): Thực hiện DNS resolve để chặn domain trỏ về private IP.
 * Hiện tại chỉ chặn được hostname dạng IP literal.
 * Ví dụ: attacker.com → 169.254.169.254 sẽ không bị chặn ở bước này.
 * Cần dùng dns.promises.lookup() rồi kiểm tra IP kết quả.
 */
export function validateMonitorUrl(url: string): void {
  // 1. Parse URL — bắt lỗi URL không hợp lệ
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new BadRequestException('URL không hợp lệ. Vui lòng kiểm tra lại định dạng.');
  }

  // 2. Chỉ cho phép http: và https:
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BadRequestException(
      `Chỉ chấp nhận URL bắt đầu bằng http:// hoặc https:// (nhận được: ${parsed.protocol}).`,
    );
  }

  // 3. Hostname không được rỗng
  const hostname = parsed.hostname.toLowerCase();
  if (!hostname) {
    throw new BadRequestException('URL phải có hostname hợp lệ.');
  }

  // 4. Không cho phép username/password trong URL
  if (parsed.username || parsed.password) {
    throw new BadRequestException(
      'URL không được chứa thông tin đăng nhập (user:password@...). Vui lòng nhập URL thuần.',
    );
  }

  // 5. Chặn hostname trong danh sách đen
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new BadRequestException(
      `URL trỏ tới địa chỉ bị chặn (${hostname}). Không thể giám sát địa chỉ nội bộ hoặc metadata endpoint.`,
    );
  }

  // 6. Chặn IP private/reserved (SSRF prevention)
  if (isPrivateIpv4(hostname)) {
    throw new BadRequestException(
      'URL trỏ tới dải IP nội bộ hoặc dành riêng. Chỉ cho phép URL công khai.',
    );
  }
}
