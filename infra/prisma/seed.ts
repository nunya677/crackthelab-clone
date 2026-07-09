import { PrismaClient } from '../generated/client/index.js';
import { hashFlag } from '../src/flag.js';

const prisma = new PrismaClient();

// NOTE: every upsert below passes the *same* data object to both `update`
// and `create`. Prisma's upsert only applies `update` when the row already
// exists, so an empty `update: {}` (the previous shape of this file) means
// re-running the seed after editing a description/points/flag never
// actually applies that edit to an existing database — it silently no-ops.
// Passing the same object to both branches keeps existing rows in sync.

async function main() {
  const categoryData = [
    { name: 'Foundations', slug: 'foundations' },
    { name: 'Cryptography', slug: 'crypto' },
    { name: 'Forensics', slug: 'forensics' },
    { name: 'Web Exploitation', slug: 'web' },
    { name: 'Misc', slug: 'misc' },
  ];
  const categories = await Promise.all(
    categoryData.map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: c,
        create: c,
      }),
    ),
  );

  const foundations = categories.find((c) => c.slug === 'foundations')!;
  const crypto = categories.find((c) => c.slug === 'crypto')!;
  const forensics = categories.find((c) => c.slug === 'forensics')!;
  const web = categories.find((c) => c.slug === 'web')!;
  const misc = categories.find((c) => c.slug === 'misc')!;

  const challenges = [
    {
      slug: 'caesar-cipher',
      title: 'Caesar’s Secret',
      description:
        'A message was intercepted, shifted by an unknown amount. Decode it to find the flag:\n\n' +
        '`synt{ebg13_vf_abg_rapelcgvba}`\n\n' +
        'Flags are formatted `flag{...}`.',
      categoryId: crypto.id,
      difficulty: 'EASY' as const,
      points: 50,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{rot13_is_not_encryption}'),
      isActive: true,
    },
    {
      slug: 'hidden-metadata',
      title: 'Hidden in Plain Sight',
      description:
        'A suspect’s uploaded photo was pulled from the server. Running `exiftool` against it ' +
        'gives the dump below — something in there isn’t a normal camera field:\n\n' +
        '```\n' +
        'Make                            : NIKON CORPORATION\n' +
        'Model                           : NIKON D750\n' +
        'Software                        : Adobe Photoshop\n' +
        'User Comment                    : aGlkZGVuX2luX3BsYWluX2V4aWY=\n' +
        'GPS Position                    : 51 deg 30\' 0.00" N, 0 deg 7\' 0.00" W\n' +
        '```\n\n' +
        'Decode the `User Comment` field and wrap it as `flag{...}`.',
      categoryId: forensics.id,
      difficulty: 'EASY' as const,
      points: 75,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{hidden_in_plain_exif}'),
      isActive: true,
    },
    {
      slug: 'base-instincts',
      title: 'Base Instincts',
      description:
        'A dev accidentally logged this string thinking it was "encrypted enough". It looks like ' +
        'someone reversed the output of an encoder:\n\n' +
        '```\n' +
        '9dmbpR2bj52MfZ2bfNnczkXYst3ZhxmZ\n' +
        '```\n\n' +
        'Figure out what was done to the flag, and undo it.',
      categoryId: crypto.id,
      difficulty: 'EASY' as const,
      points: 50,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{lay3rs_of_3ncoding}'),
      isActive: true,
    },
    {
      slug: 'xor-marks-the-spot',
      title: 'XOR Marks the Spot',
      description:
        'Every byte of the flag was XORed against the same single-byte key before it was written ' +
        'to disk:\n\n' +
        '```\n' +
        '4c464b4d51521a58751b5975584f5c4f58591b48464f57\n' +
        '```\n\n' +
        'There are only 256 possible keys — brute force it, or notice that the flag has to start ' +
        'with `flag{` and work the key out from there.',
      categoryId: crypto.id,
      difficulty: 'MEDIUM' as const,
      points: 100,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{x0r_1s_revers1ble}'),
      isActive: true,
      isPremium: true,
    },
    {
      slug: 'null-byte-noise',
      title: 'Null Byte Noise',
      description:
        'A memory dump contains this run of bytes. It looks like garbage at first glance — lots ' +
        'of `00`s breaking up what should be readable text:\n\n' +
        '```\n' +
        '66 00 6c 00 61 00 67 00 7b 00 75 00 74 00 66 00 31 00 36 00 5f 00 68 00 69 00 64 00 65 00\n' +
        '73 00 5f 00 69 00 6e 00 5f 00 70 00 6c 00 61 00 69 00 6e 00 5f 00 73 00 69 00 67 00 68 00\n' +
        '74 00 7d 00\n' +
        '```\n\n' +
        'Think about what character encoding pads every ASCII byte with a `00`.',
      categoryId: forensics.id,
      difficulty: 'MEDIUM' as const,
      points: 100,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{utf16_hides_in_plain_sight}'),
      isActive: true,
      isPremium: true,
    },
    {
      slug: 'view-source',
      title: 'View Source',
      description:
        'A retired marketing page for the platform. Old habits die hard — someone always forgets ' +
        'to strip the comments before pushing to prod:\n\n' +
        '```html\n' +
        '<!-- TODO: replace this hero image before launch -->\n' +
        '<div class="hero">\n' +
        '  <h1>Welcome to ExploitYard</h1>\n' +
        '  <!-- FIXME: mobile nav is broken on Safari -->\n' +
        '  <!-- flag{always_check_the_source} -->\n' +
        '  <p>Train like an attacker. Think like a defender.</p>\n' +
        '</div>\n' +
        '```',
      categoryId: misc.id,
      difficulty: 'EASY' as const,
      points: 50,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{always_check_the_source}'),
      isActive: true,
    },
    {
      slug: 'idor-much',
      title: 'IDOR Much?',
      description:
        'A tiny internal tool lets staff look up their own profile by ID. Start an instance, log ' +
        'in as yourself, and see what happens if you look up someone else\'s.',
      categoryId: web.id,
      difficulty: 'HARD' as const,
      points: 175,
      type: 'LIVE' as const,
      dockerImage: 'crackthelab/idor-much:latest',
      flagHash: hashFlag('flag{1d0r_1s_2_easy}'),
      isActive: true,
      isPremium: true,
    },
    {
      slug: 'small-factors',
      title: 'Small Factors',
      description:
        'An intern rolled their own RSA keypair for a demo and used primes that were... not large ' +
        'enough. The flag is hidden as the two prime factors of `n` themselves:\n\n' +
        '```\n' +
        'n = 136117223861\n' +
        '```\n\n' +
        'Factor `n` into its two prime factors `p` and `q`, then submit ' +
        '`flag{p_q}` with the smaller factor first.',
      categoryId: crypto.id,
      difficulty: 'HARD' as const,
      points: 150,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{104729_1299709}'),
      isActive: true,
      isPremium: true,
    },
    {
      slug: 'binary-whispers',
      title: 'Binary Whispers',
      description:
        'A corrupted terminal session log recovered from a compromised host contains this run of ' +
        '1s and 0s:\n\n' +
        '```\n' +
        '01100110 01101100 01100001 01100111 01111011 01100010 00110001 01101110 00110100 01110010\n' +
        '01111001 01011111 01110111 01101000 00110001 01110011 01110000 00110011 01110010 01110011\n' +
        '01011111 00110001 01101110 01011111 01110100 01101000 00110011 01011111 01101100 00110000\n' +
        '01100111 01111101\n' +
        '```\n\n' +
        'Each group of 8 bits is one ASCII character. Convert it back to text.',
      categoryId: forensics.id,
      difficulty: 'MEDIUM' as const,
      points: 75,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{b1n4ry_wh1sp3rs_1n_th3_l0g}'),
      isActive: true,
      isPremium: true,
    },
    {
      slug: 'know-your-protocols',
      title: 'Know Your Protocols',
      description:
        'A riddle, for a change — no decoding required:\n\n' +
        '_I encrypt your secrets in transit, hide behind a padlock icon in your browser bar, and ' +
        'greet every connection with a handshake instead of a hello. What protocol am I?_\n\n' +
        'Submit the answer in lowercase as `flag{...}`.',
      categoryId: misc.id,
      difficulty: 'MEDIUM' as const,
      points: 75,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{tls}'),
      isActive: true,
      isPremium: true,
    },
    {
      slug: 'broken-auth',
      title: 'Broken Auth',
      description:
        'A staff dashboard issues JSON Web Tokens after login. Start an instance, log in with the ' +
        'demo account shown on the page, inspect the token you get back, and see if the server ' +
        'really checks it as carefully as it should before granting the `/admin` role.',
      categoryId: web.id,
      difficulty: 'HARD' as const,
      points: 200,
      type: 'LIVE' as const,
      dockerImage: 'crackthelab/broken-auth:latest',
      flagHash: hashFlag('flag{alg_none_is_a_lie}'),
      isActive: true,
      isPremium: true,
    },
    {
      slug: 'key-of-hearts',
      title: 'Key of Hearts',
      description:
        'A short message was encrypted with a repeating-key cipher — each letter shifted by an ' +
        'amount that cycles through a short keyword instead of staying fixed like Caesar:\n\n' +
        '```\n' +
        'GQSIYMDI VMKW CMBILB\n' +
        '```\n\n' +
        'The key is 4 letters long and, fittingly for this platform, is the name of a color. ' +
        'Recover the plaintext and submit it as `flag{...}`, lowercase, spaces as underscores.',
      categoryId: crypto.id,
      difficulty: 'MEDIUM' as const,
      points: 100,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{vigenere_keys_repeat}'),
      isActive: true,
      isPremium: true,
    },
    {
      slug: 'needle-in-the-log',
      title: 'Needle in the Access Log',
      description:
        'A web server\'s access log was pulled after a suspected data scrape. Most of this traffic ' +
        'is normal — one IP address is not behaving like a normal user:\n\n' +
        '```\n' +
        '192.168.1.10 - - [03/Jul/2026:10:12:01 +0000] "GET /dashboard HTTP/1.1" 200 512\n' +
        '192.168.1.10 - - [03/Jul/2026:10:12:04 +0000] "GET /static/app.css HTTP/1.1" 200 2048\n' +
        '203.0.113.77 - - [03/Jul/2026:10:14:10 +0000] "GET /api/users/1 HTTP/1.1" 200 128\n' +
        '203.0.113.77 - - [03/Jul/2026:10:14:10 +0000] "GET /api/users/2 HTTP/1.1" 200 130\n' +
        '203.0.113.77 - - [03/Jul/2026:10:14:11 +0000] "GET /api/users/3 HTTP/1.1" 200 129\n' +
        '203.0.113.77 - - [03/Jul/2026:10:14:11 +0000] "GET /api/users/4 HTTP/1.1" 200 131\n' +
        '198.51.100.23 - - [03/Jul/2026:10:15:02 +0000] "GET /login HTTP/1.1" 200 843\n' +
        '203.0.113.77 - - [03/Jul/2026:10:14:12 +0000] "GET /api/users/5 HTTP/1.1" 200 128\n' +
        '203.0.113.77 - - [03/Jul/2026:10:14:12 +0000] "GET /api/users/6 HTTP/1.1" 200 133\n' +
        '192.168.1.10 - - [03/Jul/2026:10:16:00 +0000] "POST /logout HTTP/1.1" 302 0\n' +
        '```\n\n' +
        'Find the IP address sequentially enumerating user IDs, and submit it with dots replaced ' +
        'by dashes: `flag{111-222-333-444}`-style.',
      categoryId: forensics.id,
      difficulty: 'MEDIUM' as const,
      points: 100,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{203-0-113-77}'),
      isActive: true,
      isPremium: true,
    },
    {
      slug: 'cross-origin-chaos',
      title: 'Cross Origin Chaos',
      description:
        'A tiny account API returns sensitive data to logged-in users. Start an instance, log in ' +
        'with the demo account shown on the page, then check whether the API\'s CORS headers ' +
        'actually restrict who\'s allowed to read the response:\n\n' +
        '```\n' +
        "curl -c cookies.txt -X POST '<instance-url>/' \\\n" +
        "  --data 'username=guest&password=guest123'\n\n" +
        "curl -b cookies.txt '<instance-url>/api/secret' \\\n" +
        "  -H 'Origin: https://evil.example.com' -i\n" +
        '```\n\n' +
        'Look at the `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials` response ' +
        'headers on that second request. If the server reflects back whatever `Origin` you sent, ' +
        'combined with allowing credentials, any site on the internet could make this exact ' +
        'request through a logged-in victim\'s browser and read their response — you just proved it ' +
        'server-side with curl instead.',
      categoryId: web.id,
      difficulty: 'HARD' as const,
      points: 200,
      type: 'LIVE' as const,
      dockerImage: 'crackthelab/cross-origin-chaos:latest',
      flagHash: hashFlag('flag{cor5_credent1als_leak}'),
      isActive: true,
      isPremium: true,
    },
    {
      slug: 'sqli-101',
      title: 'SQLi 101',
      description:
        'A small login form stands between you and the flag. It talks to a real database — ' +
        'start an instance below and see if you can bypass the login with a classic injection.',
      categoryId: web.id,
      difficulty: 'MEDIUM' as const,
      points: 150,
      type: 'LIVE' as const,
      dockerImage: 'crackthelab/sqli-101:latest',
      flagHash: hashFlag('flag{sql1_1nj3ct10n_ftw}'),
      isActive: true,
      // Free tier's one taste of a real live sandbox — the rest of the live
      // challenges stay PRO-only.
      isPremium: false,
    },
    {
      slug: 'letter-swap',
      title: 'Letter Swap',
      description:
        'A message encrypted with one of the oldest substitution ciphers on record — every letter ' +
        'swapped with its mirror image in the alphabet (`a`↔`z`, `b`↔`y`, and so on):\n\n' +
        '```\n' +
        'uozt{zgyzhs_rh_zokszyvg_ivevihzo}\n' +
        '```\n\n' +
        'The cipher is its own inverse — apply the same swap again to undo it.',
      categoryId: crypto.id,
      difficulty: 'EASY' as const,
      points: 50,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{atbash_is_alphabet_reversal}'),
      isActive: true,
    },
    {
      slug: 'base32-blues',
      title: 'Base32 Blues',
      description:
        'A config file stored a secret using an encoding that looks a lot like base64, but uses a ' +
        'smaller alphabet (just uppercase letters and the digits 2–7) and pads with `=`:\n\n' +
        '```\n' +
        'MZWGCZ33MJQXGZJTGJPXAYLEONPXO2LUNBPWK4LVMFWHG7I=\n' +
        '```\n\n' +
        'Identify the encoding and decode it back to the flag.',
      categoryId: crypto.id,
      difficulty: 'EASY' as const,
      points: 50,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{base32_pads_with_equals}'),
      isActive: true,
    },
    {
      slug: 'strings-in-the-noise',
      title: 'Strings in the Noise',
      description:
        'A recovered binary was run through the `strings` command. Most of the output is ordinary ' +
        'executable noise — but one line doesn\'t belong:\n\n' +
        '```\n' +
        '/lib64/ld-linux-x86-64.so.2\n' +
        'GLIBC_2.2.5\n' +
        'libc.so.6\n' +
        '__stack_chk_fail\n' +
        'flag{strings_finds_the_plaintext}\n' +
        '__libc_start_main\n' +
        'PTRhX\n' +
        '```\n\n' +
        'Pull the flag out of the noise.',
      categoryId: forensics.id,
      difficulty: 'EASY' as const,
      points: 50,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{strings_finds_the_plaintext}'),
      isActive: true,
    },
    {
      slug: 'deserialize-this',
      title: 'Deserialize This',
      description:
        'A code review turned up this session-loading helper. Read it carefully — the vulnerability ' +
        'is in what it trusts, not in any obvious typo:\n\n' +
        '```python\n' +
        'import pickle\n' +
        'import base64\n\n' +
        'def load_session(token):\n' +
        '    # FIXME: this trusts whatever the client sends — never deserialize\n' +
        '    # untrusted input with pickle, since a crafted payload can execute\n' +
        '    # arbitrary code the moment it\'s unpickled.\n' +
        '    # flag{never_pickle_untrusted_data}\n' +
        '    data = base64.b64decode(token)\n' +
        '    return pickle.loads(data)\n' +
        '```',
      categoryId: web.id,
      difficulty: 'MEDIUM' as const,
      points: 100,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{never_pickle_untrusted_data}'),
      isActive: true,
      isPremium: true,
    },
    {
      slug: 'hash-id',
      title: 'Hash ID',
      description:
        'A leaked database column stores values that all look like this:\n\n' +
        '```\n' +
        '5f4dcc3b5a3ce3e5531dd50a48d05263\n' +
        '```\n\n' +
        'Every value is exactly 32 hexadecimal characters. That length and format identifies one ' +
        'specific, now-considered-broken hashing algorithm. Name it, lowercase, as `flag{...}`.',
      categoryId: misc.id,
      difficulty: 'EASY' as const,
      points: 50,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{md5}'),
      isActive: true,
    },
    {
      slug: 'frequency-analysis',
      title: 'Frequency Analysis',
      description:
        'Someone rolled their own cipher — every letter swapped for another, but not by a fixed ' +
        'shift like Caesar. This time the mapping is arbitrary. A longer passage was intercepted ' +
        'alongside the flag, encrypted with the same substitution:\n\n' +
        '```\n' +
        'zit jxoea wkgvf ygb pxdhl gctk zit sqmn rgu viost zit lxf ltzl lsgvsn wtiofr zit gsr ' +
        'lzgft zgvtk qfr tctkn liqrgv ukgvl sgfutk qekgll zit tdhzn lzkttz ql zit tctfofu vofr ' +
        'wtuofl zg violhtk zikgxui zit zkttl\n' +
        '```\n\n' +
        'Flag ciphertext:\n\n' +
        '```\n' +
        'ysqu{lxwlzozxzogf_yqssl_zg_yktjxtfen}\n' +
        '```\n\n' +
        'English letter frequencies aren\'t uniform — `e` and `t` show up constantly, `q` and `z` ' +
        'rarely. Count letter frequencies in the passage, match them against typical English ' +
        'frequency order, and you can recover the substitution key without ever guessing blindly.',
      categoryId: crypto.id,
      difficulty: 'MEDIUM' as const,
      points: 100,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{substitution_falls_to_frequency}'),
      isActive: true,
      isPremium: true,
    },
    {
      slug: 'parity-watermark',
      title: 'Parity Watermark',
      description:
        'A rotated set of log-file sizes (in bytes) was pulled from a compromised backup server. ' +
        'Nothing about the sizes looks unusual at a glance:\n\n' +
        '```\n' +
        '784, 335, 613, 208, 284, 231, 421, 750, 536, 397, 767, 658, 345, 213, 714, 214, 424, 273, ' +
        '803, 428, 450, 594, 406, 885, 752, 473, 267, 586, 432, 383, 605, 837, 710, 749, 601, 579, ' +
        '627, 498, 299, 761, 812, 589, 887, 685, 708, 610, 590, 898, 644, 844, 713, 337, 658, 373, ' +
        '592, 498, 834, 627, 805, 409, 386, 828, 291, 328, 520, 610, 645, 503, 640, 228, 838, 659, ' +
        '330, 423, 403, 637, 246, 633, 248, 538, 206, 401, 601, 427, 707, 682, 608, 589, 486, 465, ' +
        '296, 899, 359, 885, 781, 631, 384, 777, 445, 316, 593, 508, 538, 238, 406, 330, 255, 543, ' +
        '382, 250, 442, 397, 496, 213, 875, 440, 446, 655, 596, 684, 746, 831, 257, 630, 558, 857, ' +
        '734, 889, 838, 835, 493, 669, 446, 760, 577, 697, 690, 389, 440, 375, 825, 479, 379, 835, ' +
        '520, 239, 463, 742, 620, 455, 292, 842, 896, 876, 685, 629, 274, 881, 344, 246, 242, 377, ' +
        '427, 475, 794, 871, 824, 866, 366, 681, 873, 360, 378, 580, 504, 773, 742, 267, 589, 557, ' +
        '587, 773, 610, 747\n' +
        '```\n\n' +
        'Take each size modulo 2 — even is a `0` bit, odd is a `1` bit. Group the resulting ' +
        'bitstream 8 bits at a time and convert each group from binary to an ASCII character.',
      categoryId: forensics.id,
      difficulty: 'MEDIUM' as const,
      points: 100,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{p4r1ty_h1des_d4ta}'),
      isActive: true,
      isPremium: true,
    },
    {
      slug: 'mass-assignment',
      title: 'Mass Assignment',
      description:
        'A profile-update endpoint from a code review. Read carefully — the bug isn\'t a missing ' +
        'auth check, it\'s about *which* fields get trusted:\n\n' +
        '```js\n' +
        'app.patch("/api/profile", requireAuth, async (req, res) => {\n' +
        '  // FIXME: spreads the entire request body into the update — the form\n' +
        '  // only sends { name, bio }, but nothing stops a raw API request from\n' +
        '  // also including { role: "admin" } or { isPremium: true }, and this\n' +
        '  // code would happily write it.\n' +
        '  // flag{mass_4ss1gnm3nt_str1kes_4ga1n}\n' +
        '  const updated = await User.update(req.user.id, { ...req.body });\n' +
        '  res.json(updated);\n' +
        '});\n' +
        '```',
      categoryId: web.id,
      difficulty: 'MEDIUM' as const,
      points: 100,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{mass_4ss1gnm3nt_str1kes_4ga1n}'),
      isActive: true,
      isPremium: true,
    },
    {
      slug: 'open-redirect',
      title: 'Open Redirect',
      description:
        'A "continue to your destination" link, pulled from a login flow\'s source:\n\n' +
        '```js\n' +
        'app.get("/login/success", (req, res) => {\n' +
        '  // FIXME: redirects wherever `next` says, no allowlist check — an\n' +
        '  // attacker can send a victim a link to this site\'s own trusted\n' +
        '  // domain that silently bounces them to an attacker-controlled page,\n' +
        '  // which is exactly the kind of link people are trained to trust.\n' +
        '  // flag{trust_the_domain_not_the_query_string}\n' +
        '  res.redirect(req.query.next);\n' +
        '});\n' +
        '```',
      categoryId: web.id,
      difficulty: 'EASY' as const,
      points: 50,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{trust_the_domain_not_the_query_string}'),
      isActive: true,
    },
    {
      slug: 'well-known-port',
      title: 'Well-Known Port',
      description:
        'One more riddle:\n\n' +
        '_I default to port 22, replaced an insecure plaintext cousin from the 90s, and every ' +
        '`user@host` login starts by asking you to trust my host key. What protocol am I?_\n\n' +
        'Submit the answer in lowercase as `flag{...}`.',
      categoryId: misc.id,
      difficulty: 'EASY' as const,
      points: 50,
      type: 'STATIC' as const,
      flagHash: hashFlag('flag{ssh}'),
      isActive: true,
    },
  ];

  for (const data of challenges) {
    await prisma.challenge.upsert({ where: { slug: data.slug }, update: data, create: data });
  }

  const lessons = [
    {
      slug: 'welcome-to-the-academy',
      title: 'Welcome to the Academy',
      categoryId: foundations.id,
      summary: 'How to get the most out of this platform, and how attackers actually think.',
      content:
        'Every lesson here follows the same shape: what the vulnerability is, why it works, and ' +
        'how it\'s actually fixed — then a link to a challenge where you exploit it yourself. ' +
        'Reading without practicing (or practicing without understanding *why* something works) ' +
        'both leave gaps, so the two are paired deliberately.\n\n' +
        'A useful mental model for almost everything you\'ll find here: security bugs are usually ' +
        'not exotic. They\'re a system trusting something it shouldn\'t — a URL parameter, a ' +
        'request header, a token\'s own claim about itself, an algorithm the client picked. ' +
        'Attacking something is mostly asking "what is this system assuming about my input, and ' +
        'what happens if that assumption is wrong?"\n\n' +
        'A few suggestions for working through this Academy:\n\n' +
        '- Start with the **Foundations** track below — it\'s short, and everything else builds on it.\n' +
        '- Don\'t skip straight to the flag. The challenges are built to be solvable by reasoning ' +
        'through the technique, not by guessing.\n' +
        '- If a challenge feels stuck, re-read its lesson — the answer to "why isn\'t this working" ' +
        'is almost always in there.',
      challengeSlugs: [],
    },
    {
      slug: 'cia-triad',
      title: 'The CIA Triad',
      categoryId: foundations.id,
      summary: 'The three properties almost every security control is trying to protect.',
      content:
        'Nearly every vulnerability in this Academy — and in the real world — is a failure of one ' +
        'of three properties, usually shortened to the **CIA triad**:\n\n' +
        '- **Confidentiality**: only the right people can read the data. Broken by things like ' +
        'IDOR, CORS misconfiguration, and hard-coded secrets — all covered elsewhere in this track.\n' +
        '- **Integrity**: data can\'t be modified by someone who shouldn\'t be able to. Broken by ' +
        'things like SQL injection (rewriting a query\'s logic) and JWT forgery (rewriting a ' +
        'token\'s claims).\n' +
        '- **Availability**: the system stays up and usable for legitimate users. Broken by denial ' +
        'of service — deliberately outside the scope of what this platform teaches you to *do*, ' +
        'but still a core part of what defenders protect.\n\n' +
        'When you\'re looking at a new system, asking "which of these three is at risk here, and ' +
        'how" is a fast way to orient yourself before diving into specifics.',
      challengeSlugs: [],
    },
    {
      slug: 'owasp-top-10',
      title: 'OWASP Top 10: A Map of Common Web Vulnerabilities',
      categoryId: foundations.id,
      summary: 'The industry-standard checklist of what actually goes wrong in web apps.',
      content:
        'The OWASP Top 10 is a periodically-updated list, maintained by a nonprofit security ' +
        'community, ranking the most common and impactful web application vulnerability ' +
        'categories. It\'s not a specific bug list — it\'s a map of *categories* of failure, and ' +
        'it\'s the closest thing the industry has to a shared vocabulary for "what usually goes ' +
        'wrong."\n\n' +
        'Several categories map directly onto challenges in this Academy:\n\n' +
        '- **Injection** (SQL injection) — see *SQL Injection*.\n' +
        '- **Broken Access Control** (IDOR) — see *Insecure Direct Object References*.\n' +
        '- **Identification and Authentication Failures** (weak JWT handling) — see ' +
        '*JWT Signature Confusion*.\n' +
        '- **Security Misconfiguration** (permissive CORS) — see *CORS Misconfiguration*.\n\n' +
        'None of these are edge cases — they\'re consistently the most-reported vulnerability ' +
        'classes in real bug bounty programs and breach post-mortems, year after year. Learning ' +
        'to recognize them by category, not just by specific example, is what lets the pattern ' +
        'transfer to systems you\'ve never seen before.',
      challengeSlugs: ['sqli-101', 'idor-much', 'broken-auth', 'cross-origin-chaos'],
    },
    {
      slug: 'password-security-hashing',
      title: 'Password Security & Hashing',
      categoryId: foundations.id,
      summary: 'Why "encrypting" a password is the wrong idea, and hashing is the right one.',
      content:
        'A password should never be stored in a form the server can read back. The standard ' +
        'approach is *hashing*: running the password through a one-way function that produces a ' +
        'fixed-length output there\'s no practical way to reverse. At login, the server hashes ' +
        'the submitted password and compares hashes — it never needs to know, or store, the ' +
        'original.\n\n' +
        'Two details separate a safe implementation from a dangerous one:\n\n' +
        '- **The algorithm matters.** Fast, general-purpose hashes like MD5 or plain SHA-256 are ' +
        'bad choices for passwords specifically *because* they\'re fast — an attacker with a ' +
        'stolen hash database can try billions of guesses per second. Purpose-built password ' +
        'hashing algorithms (bcrypt, scrypt, Argon2) are deliberately slow and tunable, so brute ' +
        'forcing them is far more expensive.\n' +
        '- **Salting matters.** A salt is random data mixed into each password before hashing, ' +
        'unique per user. Without it, two users with the same password get the same hash, and an ' +
        'attacker can precompute a table of common password hashes once (a "rainbow table") and ' +
        'reuse it against every stolen database they find. bcrypt and friends generate and store ' +
        'the salt automatically as part of the hash output.\n\n' +
        'This platform\'s own login uses bcrypt for exactly these reasons.',
      challengeSlugs: [],
    },
    {
      slug: 'defense-in-depth',
      title: 'Defense in Depth & Blue Team Basics',
      categoryId: foundations.id,
      summary: 'Why real systems assume any single control will eventually fail.',
      content:
        'Defense in depth is the principle that you shouldn\'t rely on any one control to keep a ' +
        'system safe — you layer multiple, so that one failure doesn\'t mean total compromise. A ' +
        'firewall, input validation, least-privilege database accounts, monitoring, and encrypted ' +
        'storage each catch different failure modes; none of them alone would be enough.\n\n' +
        'This is also roughly the difference in mindset between the two "teams" security work is ' +
        'often split into:\n\n' +
        '- **Red team** (offense): thinks like an attacker, tries to find the one gap that gets ' +
        'them in. Most of this Academy so far has been red-team-flavored — you\'re the one finding ' +
        'the gap.\n' +
        '- **Blue team** (defense): assumes gaps exist, and focuses on detecting and containing an ' +
        'attacker who\'s already inside — watching logs, alerting on anomalies, limiting what any ' +
        'single compromised account or service can reach.\n\n' +
        'The *Reading Access Logs Like a Blue Teamer* lesson is the most blue-team-flavored ' +
        'material here — recognizing an attack in progress, rather than executing one, is just as ' +
        'much a core security skill.',
      challengeSlugs: ['needle-in-the-log'],
    },
    {
      slug: 'sql-injection',
      title: 'SQL Injection',
      categoryId: web.id,
      summary: 'How unsanitized input lets an attacker rewrite a database query.',
      content:
        'Most login forms check credentials with something like:\n\n' +
        '```\n' +
        "SELECT * FROM users WHERE username = '<input>' AND password = '<input>'\n" +
        '```\n\n' +
        'If the app builds that string by directly pasting in what the user typed, the user isn\'t ' +
        'just supplying a value anymore — they\'re supplying *SQL*. Typing `admin\' -- ` as the ' +
        'username turns the query into:\n\n' +
        '```\n' +
        "SELECT * FROM users WHERE username = 'admin' -- ' AND password = ''\n" +
        '```\n\n' +
        '`--` starts a SQL comment, so everything after it (including the password check) is ' +
        'ignored. The query now just asks "does a user named admin exist?" — which is true — and ' +
        'the login succeeds with no valid password at all.\n\n' +
        'The fix is parameterized queries / prepared statements, which send the user\'s input as ' +
        'data rather than as part of the SQL text, so it can never change the query\'s structure.',
      challengeSlugs: ['sqli-101'],
    },
    {
      slug: 'idor',
      title: 'Insecure Direct Object References (IDOR)',
      categoryId: web.id,
      summary: 'When an app trusts an ID in the URL instead of checking who\'s asking for it.',
      content:
        'An IDOR happens when an application looks up a resource — a profile, an invoice, an ' +
        'order — using an ID supplied by the client, without checking that the logged-in user is ' +
        'actually allowed to see that particular resource.\n\n' +
        'A very common shape:\n\n' +
        '```\n' +
        'GET /profile/1   -> your own profile, because you happen to be user 1\n' +
        'GET /profile/2   -> ...someone else\'s profile, and the server hands it over anyway\n' +
        '```\n\n' +
        'The server authenticates you (it knows *who* you are), but never authorizes the specific ' +
        'request (it never checks whether *you* are allowed to see profile `2`). Attackers find ' +
        'these by simply changing IDs, slugs, or filenames in requests they\'re allowed to make and ' +
        'watching what comes back.\n\n' +
        'The fix is authorization checks on every object access: confirm the record being fetched ' +
        'actually belongs to (or is shared with) the requesting user, not just that the user is ' +
        'logged in.',
      challengeSlugs: ['idor-much'],
    },
    {
      slug: 'jwt-attacks',
      title: 'JWT Signature Confusion',
      categoryId: web.id,
      summary: 'Why trusting the algorithm a token claims for itself is dangerous.',
      content:
        'A JSON Web Token has three parts, each base64url-encoded and joined with dots: ' +
        '`header.payload.signature`. The header names the signing algorithm, e.g.:\n\n' +
        '```\n' +
        '{"alg":"HS256","typ":"JWT"}\n' +
        '```\n\n' +
        'A server verifying a token has to decide *how* to check the signature — and some ' +
        'implementations make the mistake of asking the token itself which algorithm to use. That ' +
        'creates an opening: if a server accepts `"alg":"none"` as a valid option, an attacker can ' +
        'submit a token with that header, keep whatever payload they want (like `"role":"admin"`), ' +
        'and leave the signature empty. There\'s nothing to verify, so nothing fails.\n\n' +
        'Related attacks in the same family include flipping `RS256` to `HS256` and signing with ' +
        'the server\'s public key (which the attacker can obtain) treated as an HMAC secret.\n\n' +
        'The fix: servers should hardcode which single algorithm they expect and never take that ' +
        'decision from the token, and should always verify the signature before trusting any claim ' +
        'inside the payload.',
      challengeSlugs: ['broken-auth'],
    },
    {
      slug: 'cors-misconfiguration',
      title: 'CORS Misconfiguration',
      categoryId: web.id,
      summary: 'The browser feature meant to protect you can be configured to defeat itself.',
      content:
        'Same-Origin Policy is the browser rule that stops a script on `evil.example.com` from ' +
        'reading responses from `bank.example.com`, even if your browser has an active, logged-in ' +
        'session there. CORS (Cross-Origin Resource Sharing) is how a server *opts out* of part of ' +
        'that protection — by sending headers telling the browser "actually, it\'s fine for this ' +
        'other origin to read my response."\n\n' +
        'Two headers matter most:\n\n' +
        '- **`Access-Control-Allow-Origin`**: which origin(s) are allowed to read the response.\n' +
        '- **`Access-Control-Allow-Credentials: true`**: allows that cross-origin request to be ' +
        'made *with cookies attached* — meaning it runs as the victim, using the victim\'s own ' +
        'session.\n\n' +
        'The dangerous, surprisingly common mistake is a server that reflects whatever `Origin` ' +
        'header the browser sent back as the allowed origin — effectively saying "yes" to every ' +
        'site that asks — while also setting `Allow-Credentials: true`. Combined, those two headers ' +
        'let *any* third-party page make an authenticated request to the vulnerable API using a ' +
        'visitor\'s existing cookies, and actually read the response back. The fix is a strict ' +
        'allowlist of trusted origins, checked server-side, never a blanket reflection of whatever ' +
        'the request claims.',
      challengeSlugs: ['cross-origin-chaos'],
    },
    {
      slug: 'classical-ciphers',
      title: 'Classical Ciphers & Encoding vs. Encryption',
      categoryId: crypto.id,
      summary: 'Caesar shifts, ROT13, and why encoding is not the same thing as encryption.',
      content:
        'A Caesar cipher shifts every letter in the alphabet by a fixed amount — `A` becomes `D` ' +
        'with a shift of 3, `B` becomes `E`, and so on. ROT13 is the special case where the shift ' +
        'is 13, which makes it its own inverse (apply it twice and you\'re back where you started).\n\n' +
        'These are fun puzzles, but they provide essentially no real security: there are only 25 ' +
        'possible shifts, so brute-forcing every one takes milliseconds.\n\n' +
        'A closely related trap is confusing *encoding* with *encryption*. Base64 turns arbitrary ' +
        'bytes into printable text so they survive things like being pasted into JSON or a URL — ' +
        'but it uses no secret key at all, so anyone can decode it instantly. Stacking multiple ' +
        'encodings (say, base64 the text, then reverse the string) can look intimidating, but if ' +
        'there\'s no secret key involved anywhere, it\'s obfuscation, not encryption, and a patient ' +
        'attacker will always be able to peel each layer back off.',
      challengeSlugs: ['caesar-cipher', 'base-instincts'],
    },
    {
      slug: 'vigenere-cipher',
      title: 'The Vigenère Cipher',
      categoryId: crypto.id,
      summary: 'A repeating keyword makes Caesar harder to break — but not by much.',
      content:
        'A Vigenère cipher improves on Caesar by shifting each letter by an amount that comes from ' +
        'a repeating keyword instead of one fixed number. `HELLO` encrypted with the key `AB` ' +
        'shifts `H` by `A` (0), `E` by `B` (1), `L` by `A` (0), and so on, wrapping the key back to ' +
        'the start once it runs out.\n\n' +
        'This defeats simple frequency analysis on single letters, since the same plaintext letter ' +
        'can encrypt to different ciphertext letters depending on where it falls in the key cycle. ' +
        'But it has its own weakness: if you can figure out the key\'s *length*, the ciphertext ' +
        'splits into that many separate Caesar ciphers (one per key letter), and each of those is ' +
        'trivial to brute-force independently. Classical techniques like the Kasiski examination ' +
        'find the key length by looking for repeated substrings in the ciphertext and measuring the ' +
        'distance between them.\n\n' +
        'For a short, known-format message (like a flag), it\'s often faster to just guess a ' +
        'plausible key length and brute-force from there than to run a full statistical attack.',
      challengeSlugs: ['key-of-hearts'],
    },
    {
      slug: 'xor-cipher',
      title: 'XOR Ciphers',
      categoryId: crypto.id,
      summary: 'A single repeated key is easy to recover once you know any part of the plaintext.',
      content:
        'XOR (`^`) has a convenient property: `A ^ B ^ B == A`. That makes it tempting to "encrypt" ' +
        'by XOR-ing every byte of a message against a repeating key, and decrypt by XOR-ing again ' +
        'with the same key.\n\n' +
        'The problem is that XOR with a short, fixed key is trivially breakable. If you can guess ' +
        'or already know *any* fragment of the plaintext — like the fact that a CTF flag always ' +
        'starts with `flag{` — you can XOR that known fragment against the matching ciphertext ' +
        'bytes and recover the key directly, no brute force required:\n\n' +
        '```\n' +
        'key_byte = ciphertext_byte ^ known_plaintext_byte\n' +
        '```\n\n' +
        'Even without a known fragment, a single-byte XOR key only has 256 possibilities, so a ' +
        'brute-force search across every key and a check for readable output finds it instantly. ' +
        'Real encryption schemes derive a long, non-repeating keystream (or use an established ' +
        'cipher like AES) specifically so this kind of shortcut isn\'t possible.',
      challengeSlugs: ['xor-marks-the-spot'],
    },
    {
      slug: 'rsa-and-factoring',
      title: 'RSA & Why Key Size Matters',
      categoryId: crypto.id,
      summary: 'RSA\'s security rests entirely on factoring being hard — for large enough numbers.',
      content:
        'RSA generates a public modulus `n` by multiplying two large prime numbers, `p` and `q`. ' +
        'Encryption and decryption both depend on those two primes, but only the product `n` is ' +
        'ever published — the security of the whole scheme rests on the fact that, given a large ' +
        'enough `n`, factoring it back into `p` and `q` is computationally infeasible.\n\n' +
        '"Large enough" is doing a lot of work in that sentence. Real RSA keys use primes hundreds ' +
        'of digits long. If someone generates a modulus from small primes — the kind a laptop can ' +
        'factor in well under a second with basic trial division or Pollard\'s rho — the entire ' +
        'scheme collapses, because recovering `p` and `q` lets an attacker reconstruct the private ' +
        'key directly.\n\n' +
        'This is why key sizes for RSA keep growing over time: it\'s not that the algorithm gets ' +
        'weaker, it\'s that factoring keeps getting cheaper as hardware improves.',
      challengeSlugs: ['small-factors'],
    },
    {
      slug: 'hidden-in-metadata',
      title: 'Data Hiding in File Metadata',
      categoryId: forensics.id,
      summary: 'Files carry a lot more than their visible content — metadata is a common leak.',
      content:
        'Most file formats carry metadata alongside their visible content: photos have EXIF data ' +
        '(camera model, GPS coordinates, timestamps), documents have author/editing-history fields, ' +
        'and many formats support arbitrary "comment" fields that tools like `exiftool` can dump.\n\n' +
        'From a forensics standpoint, that metadata is often more revealing than the file itself — ' +
        'it can leak the software used to create a file, the device it came from, or, in a CTF ' +
        'context, a flag someone tucked into a field nobody thought to check. From a security ' +
        'standpoint, it\'s a classic accidental-disclosure vector: a screenshot can carry GPS data, ' +
        'a PDF can carry an author\'s real name, a scrubbed document can still have "deleted" text ' +
        'sitting in its revision history.\n\n' +
        'The practical lesson either way: always inspect metadata, and if you\'re the one publishing ' +
        'a file, strip it first.',
      challengeSlugs: ['hidden-metadata'],
    },
    {
      slug: 'log-analysis',
      title: 'Reading Access Logs Like a Blue Teamer',
      categoryId: forensics.id,
      summary: 'Most attacks leave a pattern in the logs — if you know what normal looks like.',
      content:
        'A web server access log records, at minimum, the source IP, timestamp, HTTP method and ' +
        'path, response code, and response size for every request. Individually, each line looks ' +
        'mundane. The signal is in the *pattern* across many lines.\n\n' +
        'A few patterns worth recognizing on sight:\n\n' +
        '- **Sequential ID enumeration**: the same IP hitting `/api/users/1`, `/api/users/2`, ' +
        '`/api/users/3`... in quick succession. A real user doesn\'t browse resources in numeric ' +
        'order — this is a script probing for an IDOR or scraping every record it can reach.\n' +
        '- **Credential stuffing / brute force**: a burst of `POST /login` requests from one IP in ' +
        'a short window, often with a consistent response size for failures.\n' +
        '- **Directory/path scanning**: rapid requests to paths like `/admin`, `/.env`, `/backup.zip` ' +
        'that a normal user would never navigate to directly — a tool hunting for exposed files.\n\n' +
        'This kind of review is exactly what turns "we got hacked" into "here\'s the IP, here\'s ' +
        'what they took, here\'s when it started" — which is the entire job of incident response.',
      challengeSlugs: ['needle-in-the-log'],
    },
    {
      slug: 'encoding-tricks',
      title: 'Character Encodings as a Hiding Spot',
      categoryId: forensics.id,
      summary: 'Data doesn\'t stop being readable just because it isn\'t stored as plain ASCII.',
      content:
        'Text can be represented in memory or on disk in more than one way, and forensic analysis ' +
        'often means recognizing an encoding before you can read what\'s actually there.\n\n' +
        'Two examples worth knowing:\n\n' +
        '- **UTF-16**: each character takes two bytes instead of one. For plain ASCII text, that ' +
        'means every visible character is followed (or preceded) by a `00` byte. A hex dump of ' +
        'UTF-16 ASCII text looks like noise at a glance, but the pattern of every other byte being ' +
        'zero is the tell.\n' +
        '- **Binary dumps**: raw `1`s and `0`s are just ASCII values spelled out one bit at a time, ' +
        '8 bits per character. Grouping the bits and converting each group from base 2 gets you back ' +
        'to text.\n\n' +
        'Neither of these is encryption or even deliberate obfuscation most of the time — they\'re ' +
        'just encodings that look unfamiliar until you recognize the pattern. A big part of forensic ' +
        'work is pattern-matching your way to "oh, this is just X encoded as Y."',
      challengeSlugs: ['null-byte-noise', 'binary-whispers'],
    },
    {
      slug: 'web-recon-basics',
      title: 'Reading the Source',
      categoryId: misc.id,
      summary: 'The single most underused button in a browser: View Source.',
      content:
        'Before trying anything fancy, basic web reconnaissance starts with just reading what the ' +
        'server actually sent you: view-source, browser dev tools\' Elements/Network tabs, and ' +
        'files like `robots.txt` or `sitemap.xml` that politely tell you which paths exist.\n\n' +
        'HTML comments are a perennial source of accidental leaks — `<!-- -->` blocks never render ' +
        'in the page, so developers treat them as a safe scratchpad for TODOs, debug notes, or ' +
        '(occasionally, embarrassingly) credentials and internal URLs. None of that is hidden from ' +
        'anyone who opens the page source; it\'s sent to every visitor\'s browser in full.\n\n' +
        'This is a low-effort, high-value first step in almost any web assessment: read everything ' +
        'the server sends before assuming you need to attack anything.',
      challengeSlugs: ['view-source'],
    },
    {
      slug: 'transport-security-tls',
      title: 'TLS: Encrypting the Wire',
      categoryId: misc.id,
      summary: 'What the padlock icon is actually protecting, and what it isn\'t.',
      content:
        'TLS (the successor to SSL) is what turns `http://` into `https://`. When your browser ' +
        'connects to a server over TLS, the two sides perform a handshake: they agree on a cipher ' +
        'suite, the server proves its identity with a certificate, and they establish a shared key ' +
        'used to encrypt everything that follows.\n\n' +
        'What that buys you: anyone intercepting traffic between you and the server (on public ' +
        'wifi, a compromised router, an ISP) sees only ciphertext, not your requests, cookies, or ' +
        'form data.\n\n' +
        'What it does *not* buy you: TLS protects data in transit, not the application behind it. A ' +
        'site can be perfectly TLS-encrypted and still have a SQL injection, an IDOR, or a broken ' +
        'JWT check — the padlock icon says "nobody sniffed this connection," not "this app is ' +
        'secure." Every other lesson in this section is about vulnerabilities TLS has nothing to ' +
        'say about.',
      challengeSlugs: ['know-your-protocols'],
    },
    {
      slug: 'substitution-ciphers',
      title: 'Substitution Ciphers & the Atbash Cipher',
      categoryId: crypto.id,
      summary: 'Swapping letters for other letters — and why a fixed mapping never holds up.',
      content:
        'A substitution cipher replaces every letter with another according to some fixed mapping. ' +
        'Atbash is the simplest possible version: the mapping is just the alphabet reversed (`a`↔`z`, ' +
        '`b`↔`y`, and so on), which makes it its own inverse — encrypting twice gets you back to the ' +
        'original text.\n\n' +
        'Like Caesar, Atbash has no key at all, so there\'s nothing to brute-force — the mapping is ' +
        'public knowledge the moment you recognize the cipher. General monoalphabetic substitution ' +
        '(an arbitrary, not-reversed mapping) is harder, but still breakable: English letter ' +
        'frequencies are distinctive enough (`e` and `t` are common, `q` and `z` are rare) that ' +
        'frequency analysis on a long enough ciphertext recovers the mapping without ever knowing the ' +
        'key in advance.\n\n' +
        'The pattern across every classical cipher in this Academy: a fixed, small mapping between ' +
        'plaintext and ciphertext is eventually recoverable, whether by brute force, frequency ' +
        'analysis, or just recognizing the scheme on sight.',
      challengeSlugs: ['letter-swap'],
    },
    {
      slug: 'encoding-alphabets',
      title: 'Encoding Alphabets: Base32 vs Base64',
      categoryId: crypto.id,
      summary: 'Different printable-character alphabets for the same idea: bytes as text.',
      content:
        'Base64 and Base32 solve the same problem — representing arbitrary binary data as printable ' +
        'text — using different-sized alphabets. Base64 uses 64 characters (so 6 bits of data per ' +
        'output character); Base32 uses a smaller, 32-character alphabet (uppercase letters plus the ' +
        'digits 2–7, deliberately excluding easily-confused characters like `0`/`O` and `1`/`I`), so ' +
        'it packs 5 bits per character instead. That makes Base32 output longer for the same input, ' +
        'but safer to read aloud, type by hand, or embed in case-insensitive systems like DNS labels.\n\n' +
        'Both pad their output to a fixed block boundary with `=` characters, and — worth repeating ' +
        'from the classical ciphers lesson — neither uses a secret key. Recognizing the alphabet is ' +
        'the entire task: no key, no brute force, just decode.',
      challengeSlugs: ['base32-blues'],
    },
    {
      slug: 'strings-command',
      title: 'The `strings` Command: Finding Text in Binaries',
      categoryId: forensics.id,
      summary: 'One of the fastest ways to learn something about a binary you can\'t run.',
      content:
        'The Unix `strings` utility scans a file for runs of printable characters and prints them, ' +
        'ignoring everything else. Run against a compiled binary, it surfaces linked library names, ' +
        'error messages, format strings, embedded URLs, version numbers, and — occasionally — things ' +
        'that were never meant to ship, like debug output, hardcoded credentials, or a leftover flag.\n\n' +
        'It\'s a blunt instrument: it doesn\'t understand the file\'s structure at all, it just looks ' +
        'for sequences of bytes that decode as printable text. That bluntness is exactly what makes it ' +
        'useful as a *first* step in analyzing an unfamiliar binary, well before reaching for a ' +
        'disassembler — most of what you find will be noise, but the signal, when it\'s there, is ' +
        'usually easy to pick out once you\'ve seen enough normal noise to recognize what doesn\'t ' +
        'belong.',
      challengeSlugs: ['strings-in-the-noise'],
    },
    {
      slug: 'insecure-deserialization',
      title: 'Insecure Deserialization',
      categoryId: web.id,
      summary: 'Turning data back into objects is not the same as turning data into a value.',
      content:
        'Serialization turns an in-memory object into a storable/transmittable format (bytes, JSON, ' +
        'XML); deserialization reverses that. The danger is format-specific: some serialization ' +
        'formats — Python\'s `pickle`, Java\'s native serialization, PHP\'s `unserialize` — don\'t ' +
        'just restore data, they can reconstruct arbitrary objects and, in the process, execute code ' +
        'the format defines as part of reconstructing certain object types.\n\n' +
        'That means deserializing a payload from an untrusted source (a cookie, a query parameter, a ' +
        'file upload) with one of those formats can hand an attacker code execution, not just a data ' +
        'parsing bug — they craft a malicious serialized blob, and the act of deserializing it *is* ' +
        'the exploit, no separate vulnerability required. Contrast this with a format like JSON: ' +
        'parsing untrusted JSON can only ever produce plain data (strings, numbers, objects, arrays), ' +
        'never executable behavior, which is exactly why it\'s the safer choice for untrusted input.\n\n' +
        'The fix is almost always the same: never deserialize untrusted data with a format capable of ' +
        'reconstructing arbitrary objects. If you must accept structured input from a client, use a ' +
        'data-only format like JSON and validate it against a strict schema.',
      challengeSlugs: ['deserialize-this'],
    },
    {
      slug: 'identifying-hashes',
      title: 'Identifying Hashes by Shape',
      categoryId: misc.id,
      summary: 'Length and character set alone narrow down a hash to a handful of candidates.',
      content:
        'Before you can attack a hash (or even know whether it\'s attackable), you usually need to ' +
        'identify which algorithm produced it — and the output\'s shape alone gets you most of the ' +
        'way there. Hex-encoded output length is the fastest signal:\n\n' +
        '- **32 hex characters (128 bits)**: MD5. Fast, and cryptographically broken for collision ' +
        'resistance — never appropriate for passwords.\n' +
        '- **40 hex characters (160 bits)**: SHA-1. Also broken for collision resistance, deprecated ' +
        'almost everywhere.\n' +
        '- **64 hex characters (256 bits)**: SHA-256. Still considered strong as a general-purpose ' +
        'hash — but, per the password hashing lesson elsewhere in this track, still a *bad* choice ' +
        'specifically for passwords, because it\'s fast.\n' +
        '- **A `$2b$`, `$2a$`, or `$argon2` prefix**: a purpose-built password hash (bcrypt, Argon2) ' +
        'that embeds its own algorithm identifier, cost parameter, and salt right in the string — ' +
        'exactly the properties a password hash should have.\n\n' +
        'This is often literally the first step in a real password-cracking engagement: identify the ' +
        'algorithm from the hash\'s shape before picking a tool or wordlist strategy.',
      challengeSlugs: ['hash-id'],
    },
    {
      slug: 'frequency-analysis-lesson',
      title: 'Frequency Analysis',
      categoryId: crypto.id,
      summary: 'Why any fixed letter-for-letter mapping eventually gives itself away.',
      content:
        'A general monoalphabetic substitution cipher — an arbitrary, non-reversed mapping from ' +
        'one letter to another — has 26! (about 4×10²⁶) possible keys, far too many to brute ' +
        'force. But it doesn\'t need brute forcing, because it never hides the *statistical* ' +
        'shape of the language underneath.\n\n' +
        'In English, letters appear with wildly different frequencies: `e` is by far the most ' +
        'common, followed by `t`, `a`, `o`, `i`, `n`; `q`, `x`, `z` are rare. That distribution ' +
        'survives substitution perfectly — whatever ciphertext letter `e` got mapped to will still ' +
        'be the most frequent letter in the ciphertext. Count occurrences of each ciphertext ' +
        'letter, line the counts up against the known English frequency order, and you get a ' +
        'strong first guess at the key before checking a single word.\n\n' +
        'The longer the ciphertext, the more reliable the statistics — which is exactly why real ' +
        'frequency-analysis attacks want a paragraph to work with, not just a short flag.',
      challengeSlugs: ['frequency-analysis'],
    },
    {
      slug: 'watermarking-and-covert-channels',
      title: 'Watermarking & Covert Channels',
      categoryId: forensics.id,
      summary: 'Data can be hidden in properties of a file, not just its visible content.',
      content:
        'A covert channel hides information in a place nobody thinks to look — not encrypted, ' +
        'often not even deliberately obfuscated, just tucked into a property of the data that ' +
        'looks incidental. Classic examples: the *parity* (odd/even-ness) of file sizes, the ' +
        'exact byte-length of otherwise-normal log lines, timestamps spaced at meaningful ' +
        'intervals, or the low-order bits of pixel color values in an image (the image-based ' +
        'version of this is usually called steganography specifically).\n\n' +
        'What makes these hard to spot isn\'t cryptographic strength — there\'s often no key at ' +
        'all — it\'s that the carrier data looks completely mundane. A list of file sizes doesn\'t ' +
        'invite scrutiny the way a block of base64 does. The skill is knowing which mundane-' +
        'looking properties are *capable* of carrying a signal, and checking them when something ' +
        'about a data set feels a little too uniform or a little too random.\n\n' +
        'The fix, if you\'re defending against this rather than attacking it: don\'t assume ' +
        'metadata-adjacent properties (sizes, timing, padding) are safe to leave uninspected in a ' +
        'security review just because they\'re not the "real" data.',
      challengeSlugs: ['parity-watermark'],
    },
    {
      slug: 'broken-access-control',
      title: 'Broken Access Control: IDOR, Mass Assignment & Open Redirects',
      categoryId: web.id,
      summary: 'Three different bugs, one root cause: trusting input the server should verify.',
      content:
        'Broken Access Control is OWASP\'s umbrella term for anything that lets a user do or see ' +
        'something they shouldn\'t be authorized for — and it shows up in more shapes than just ' +
        'IDOR (covered elsewhere in this track):\n\n' +
        '- **Mass assignment**: an endpoint blindly writes an entire request body into a database ' +
        'update (`User.update(req.user.id, { ...req.body })`), trusting that the client will only ' +
        'ever send the fields the *form* exposes. Nothing stops a raw API request from also ' +
        'including fields the form never showed — like `role` or `isPremium` — and having the ' +
        'server write those too. The fix is an explicit allowlist of writable fields, never a ' +
        'blind spread.\n' +
        '- **Open redirect**: an endpoint redirects to wherever a `?next=` (or similar) parameter ' +
        'says, with no check that the destination is actually part of the same site. Attackers ' +
        'weaponize this by sending links to a *trusted* domain that silently bounce the victim ' +
        'onward to an attacker-controlled page — dangerous specifically because the visible link ' +
        'really does point at a site the victim trusts. The fix is validating the redirect target ' +
        'against an allowlist of known-safe paths/domains before ever calling `redirect()`.\n\n' +
        'The pattern across all of this: authorization isn\'t just "is this user logged in?" — ' +
        'it\'s "is this exact user allowed to do this exact thing, with these exact inputs?", ' +
        'checked explicitly, every time.',
      challengeSlugs: ['mass-assignment', 'open-redirect'],
    },
    {
      slug: 'well-known-ports-lesson',
      title: 'Well-Known Ports',
      categoryId: misc.id,
      summary: 'A handful of port numbers you\'ll recognize on sight in any recon.',
      content:
        'Port numbers below 1024 are "well-known" ports, reserved by convention for specific ' +
        'services — recognizing them on sight is a basic but genuinely useful recon skill, since ' +
        'an open-port scan is often the very first thing done against a target:\n\n' +
        '- **22 — SSH**: encrypted remote shell access, the modern replacement for plaintext ' +
        'Telnet (port 23).\n' +
        '- **25 — SMTP**: outbound mail delivery between mail servers.\n' +
        '- **53 — DNS**: domain name resolution.\n' +
        '- **80 / 443 — HTTP / HTTPS**: the web, unencrypted and TLS-encrypted respectively.\n' +
        '- **3306 / 5432 — MySQL / PostgreSQL**: database servers, which should almost never be ' +
        'reachable directly from the public internet.\n\n' +
        'Seeing an unexpected port open — a database port facing the internet, an SSH port on a ' +
        'host that shouldn\'t need shell access at all — is often the very first sign something\'s ' +
        'misconfigured, before you\'ve even looked at what\'s running behind it.',
      challengeSlugs: ['well-known-port'],
    },
    {
      slug: 'threat-modeling-basics',
      title: 'Threat Modeling Basics',
      categoryId: foundations.id,
      summary: 'A lightweight way to ask "what could go wrong here?" before something does.',
      content:
        'Threat modeling is the practice of systematically asking, for a given system: who might ' +
        'attack it, what would they want, and how might they get it — done *before* something ' +
        'goes wrong, not during incident response. It doesn\'t require special tools; a whiteboard ' +
        'and a consistent set of questions gets most of the value.\n\n' +
        'A simple, widely-used framework is **STRIDE**, one letter per threat category:\n\n' +
        '- **S**poofing — pretending to be someone/something you\'re not.\n' +
        '- **T**ampering — modifying data or code without authorization.\n' +
        '- **R**epudiation — being able to deny having done something, due to missing logs/audit ' +
        'trails.\n' +
        '- **I**nformation disclosure — exposing data to someone who shouldn\'t see it.\n' +
        '- **D**enial of service — degrading or blocking legitimate use.\n' +
        '- **E**levation of privilege — gaining access beyond what was granted.\n\n' +
        'Walking through a new feature or endpoint and asking "does STRIDE apply here, and how?" ' +
        'catches a surprising number of the same bug classes taught elsewhere in this Academy — ' +
        'IDOR is an Elevation of Privilege issue, a missing audit log is Repudiation, an unrate-' +
        'limited login form is a Denial of Service risk. The value of threat modeling isn\'t the ' +
        'framework itself, it\'s making "what could go wrong" a deliberate step instead of an ' +
        'afterthought.',
      challengeSlugs: [],
    },
  ];

  for (const data of lessons) {
    await prisma.lesson.upsert({ where: { slug: data.slug }, update: data, create: data });
  }

  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
