// ─────────────────────────────────────────────
// VETRA — Instagram Real Analysis via RocketAPI
// Docs: https://rapidapi.com/rocketapi/api/rocketapi-for-instagram
// Plano gratuito: 100 req/mês
// ─────────────────────────────────────────────

const RAPIDAPI_HOST = 'rocketapi-for-instagram.p.rapidapi.com';
const RAPIDAPI_URL = `https://${RAPIDAPI_HOST}`;

// Timeout por request
const REQUEST_TIMEOUT_MS = 8000;

export interface InstagramProfile {
  username: string;
  full_name: string;
  biography: string;
  followers: number;
  following: number;
  posts_count: number;
  is_verified: boolean;
  is_private: boolean;
  has_profile_pic: boolean;
  profile_pic_url: string | null;
  external_url: string | null;
  is_business: boolean;
  category: string | null;
  // Sinais calculados
  follower_following_ratio: number;
  engagement_score: number; // estimativa baseada em seguidores/posts
  account_quality: 'fake' | 'suspicious' | 'low' | 'medium' | 'high' | 'verified';
}

export interface InstagramAnalysis {
  found: boolean;
  profile: InstagramProfile | null;
  signals: {
    profile_exists: boolean;
    is_public: boolean;
    is_verified: boolean;
    has_bio: boolean;
    has_profile_pic: boolean;
    has_posts: boolean;
    good_follower_ratio: boolean;
    enough_followers: boolean;
    not_bot_pattern: boolean;
    has_external_url: boolean;
  };
  error?: string;
}

function calculateFollowerRatio(followers: number, following: number): number {
  if (following === 0) return followers > 0 ? 10 : 0;
  return parseFloat((followers / following).toFixed(2));
}

function detectBotPattern(followers: number, following: number, posts: number): boolean {
  // Padrões comuns de bot:
  // - Muitos seguindo, poucos seguidores
  // - Quase sem posts mas muitos seguindo
  // - Ratio muito desbalanceado
  if (following > 5000 && followers < 100) return true;
  if (posts < 3 && following > 500) return true;
  if (following > 0 && followers / following < 0.05 && following > 1000) return true;
  return false;
}

function calculateAccountQuality(profile: Omit<InstagramProfile, 'follower_following_ratio' | 'engagement_score' | 'account_quality'>): InstagramProfile['account_quality'] {
  if (profile.is_verified) return 'verified';

  let score = 0;
  if (!profile.is_private) score += 1;
  if (profile.biography) score += 1;
  if (profile.has_profile_pic) score += 1;
  if (profile.posts_count >= 5) score += 1;
  if (profile.posts_count >= 20) score += 1;
  if (profile.followers >= 100) score += 1;
  if (profile.followers >= 500) score += 1;
  if (profile.external_url) score += 1;

  const ratio = calculateFollowerRatio(profile.followers, profile.following);
  if (ratio >= 0.5) score += 1;
  if (ratio >= 1.0) score += 1;

  const isBot = detectBotPattern(profile.followers, profile.following, profile.posts_count);
  if (isBot) return 'fake';

  if (score <= 2) return 'suspicious';
  if (score <= 4) return 'low';
  if (score <= 6) return 'medium';
  return 'high';
}

export async function analyzeInstagramProfile(
  username: string
): Promise<InstagramAnalysis> {
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    console.warn('⚠️  RAPIDAPI_KEY não configurada. Análise Instagram desativada.');
    return {
      found: false,
      profile: null,
      signals: {
        profile_exists: false,
        is_public: false,
        is_verified: false,
        has_bio: false,
        has_profile_pic: false,
        has_posts: false,
        good_follower_ratio: false,
        enough_followers: false,
        not_bot_pattern: false,
        has_external_url: false,
      },
      error: 'RAPIDAPI_KEY não configurada',
    };
  }

  const cleaned = username.replace('@', '').trim().toLowerCase();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(`${RAPIDAPI_URL}/instagram/user/get_info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
      body: JSON.stringify({ username: cleaned }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error('❌ RocketAPI error:', response.status, errText);
      return {
        found: false,
        profile: null,
        signals: buildEmptySignals(),
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();

    // RocketAPI retorna { response: { body: { data: { user: {...} } } } }
    const user = data?.response?.body?.data?.user;

    if (!user) {
      return {
        found: false,
        profile: null,
        signals: buildEmptySignals(),
        error: 'Perfil não encontrado',
      };
    }

    const baseProfile = {
      username: user.username || cleaned,
      full_name: user.full_name || '',
      biography: user.biography || '',
      followers: user.edge_followed_by?.count || 0,
      following: user.edge_follow?.count || 0,
      posts_count: user.edge_owner_to_timeline_media?.count || 0,
      is_verified: user.is_verified || false,
      is_private: user.is_private || false,
      has_profile_pic: !!user.profile_pic_url && !user.profile_pic_url.includes('default'),
      profile_pic_url: user.profile_pic_url || null,
      external_url: user.external_url || null,
      is_business: user.is_business_account || false,
      category: user.category_name || null,
    };

    const follower_following_ratio = calculateFollowerRatio(
      baseProfile.followers,
      baseProfile.following
    );

    const engagement_score = baseProfile.posts_count > 0
      ? Math.min(100, Math.round((baseProfile.followers / baseProfile.posts_count) * 0.1))
      : 0;

    const account_quality = calculateAccountQuality(baseProfile);

    const profile: InstagramProfile = {
      ...baseProfile,
      follower_following_ratio,
      engagement_score,
      account_quality,
    };

    const isBot = detectBotPattern(profile.followers, profile.following, profile.posts_count);

    const signals = {
      profile_exists: true,
      is_public: !profile.is_private,
      is_verified: profile.is_verified,
      has_bio: profile.biography.length > 10,
      has_profile_pic: profile.has_profile_pic,
      has_posts: profile.posts_count >= 3,
      good_follower_ratio: follower_following_ratio >= 0.5,
      enough_followers: profile.followers >= 50,
      not_bot_pattern: !isBot,
      has_external_url: !!profile.external_url,
    };

    console.log(`✅ Instagram @${cleaned}: ${profile.followers} seguidores, qualidade: ${account_quality}`);

    return { found: true, profile, signals };

  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.warn(`⚠️  Instagram @${cleaned}: timeout após ${REQUEST_TIMEOUT_MS}ms`);
    } else {
      console.error('❌ Erro ao analisar Instagram:', err.message);
    }
    return {
      found: false,
      profile: null,
      signals: buildEmptySignals(),
      error: err.message,
    };
  }
}

function buildEmptySignals(): InstagramAnalysis['signals'] {
  return {
    profile_exists: false,
    is_public: false,
    is_verified: false,
    has_bio: false,
    has_profile_pic: false,
    has_posts: false,
    good_follower_ratio: false,
    enough_followers: false,
    not_bot_pattern: false,
    has_external_url: false,
  };
}
