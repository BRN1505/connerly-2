import { supabase } from '../supabaseClient';
import { Creator, Brand, Job, ChatMessage, ScoutOffer, InboxNotification } from '../types';

// ==================== ユーザー関連 ====================

// ユーザー登録
export async function registerUser(userData: any, role: string) {
  try {
    // ユーザー情報を挿入
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{
        role,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        is_verified: false,
        subscription_status: role === 'brand' ? 'active' : null
      }])
      .select()
      .single();

    if (userError) throw userError;

    // クリエイターの場合、SNSとカテゴリーも保存
    if (role === 'creator' && user) {
      // SNSプロフィールを保存
      if (userData.socials && userData.socials.length > 0) {
        const socialProfiles = userData.socials.map((social: any) => ({
          user_id: user.id,
          platform: social.platform,
          follower_count: social.followerCount,
          profile_url: social.profileUrl
        }));

        const { error: socialError } = await supabase
          .from('social_profiles')
          .insert(socialProfiles);

        if (socialError) throw socialError;
      }

      // カテゴリーを保存
      if (userData.categories && userData.categories.length > 0) {
        const categories = userData.categories.map((cat: string) => ({
          user_id: user.id,
          category: cat
        }));

        const { error: catError } = await supabase
          .from('creator_categories')
          .insert(categories);

        if (catError) throw catError;
      }
    }

    return user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// ユーザーログイン
export async function loginUser(email: string, password: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error) throw error;
    if (!user) throw new Error('ユーザーが見つかりません');

    // クリエイターの場合、SNSとカテゴリーも取得
    if (user.role === 'creator') {
      const { data: socials } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('user_id', user.id);

      const { data: categories } = await supabase
        .from('creator_categories')
        .select('category')
        .eq('user_id', user.id);

      return {
        ...user,
        socials: socials?.map(s => ({
          platform: s.platform,
          followerCount: s.follower_count,
          profileUrl: s.profile_url
        })) || [],
        categories: categories?.map(c => c.category) || []
      };
    }

    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// 全クリエイターを取得
export async function getAllCreators() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'creator');

    if (error) throw error;

    // 各クリエイターのSNSとカテゴリーを取得
    const creatorsWithDetails = await Promise.all(
      (users || []).map(async (user) => {
        const { data: socials } = await supabase
          .from('social_profiles')
          .select('*')
          .eq('user_id', user.id);

        const { data: categories } = await supabase
          .from('creator_categories')
          .select('category')
          .eq('user_id', user.id);

        return {
          ...user,
          socials: socials?.map(s => ({
            platform: s.platform,
            followerCount: s.follower_count,
            profileUrl: s.profile_url
          })) || [],
          categories: categories?.map(c => c.category) || []
        };
      })
    );

    return creatorsWithDetails;
  } catch (error) {
    console.error('Get creators error:', error);
    throw error;
  }
}

// 全ブランドを取得
export async function getAllBrands() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'brand');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get brands error:', error);
    throw error;
  }
}

// ==================== 案件関連 ====================

// 案件を投稿
export async function postJob(jobData: any) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert([{
        brand_id: jobData.brandId,
        brand_name: jobData.brandName,
        title: jobData.title,
        description: jobData.description,
        payment: jobData.payment,
        number_of_creators: jobData.numberOfCreators,
        status: '募集中',
        payment_status: 'unpaid'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Post job error:', error);
    throw error;
  }
}

// 全案件を取得
export async function getAllJobs() {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 各案件の応募者と選択されたクリエイターを取得
    const jobsWithDetails = await Promise.all(
      (jobs || []).map(async (job) => {
        const { data: applicants } = await supabase
          .from('job_applicants')
          .select('creator_id')
          .eq('job_id', job.id);

        const { data: selected } = await supabase
          .from('job_selected_creators')
          .select('creator_id')
          .eq('job_id', job.id);

        return {
          id: job.id,
          brandId: job.brand_id,
          brandName: job.brand_name,
          title: job.title,
          description: job.description,
          payment: job.payment,
          numberOfCreators: job.number_of_creators,
          status: job.status,
          paymentStatus: job.payment_status,
          createdAt: new Date(job.created_at),
          applicants: applicants?.map(a => a.creator_id) || [],
          selectedCreatorIds: selected?.map(s => s.creator_id) || []
        };
      })
    );

    return jobsWithDetails;
  } catch (error) {
    console.error('Get jobs error:', error);
    throw error;
  }
}

// 案件に応募
export async function applyToJob(jobId: string, creatorId: string) {
  try {
    const { error } = await supabase
      .from('job_applicants')
      .insert([{ job_id: jobId, creator_id: creatorId }]);

    if (error) throw error;
  } catch (error) {
    console.error('Apply to job error:', error);
    throw error;
  }
}

// クリエイターを選択
export async function selectCreator(jobId: string, creatorId: string) {
  try {
    const { error } = await supabase
      .from('job_selected_creators')
      .insert([{ job_id: jobId, creator_id: creatorId }]);

    if (error) throw error;

    // 選択されたクリエイター数を確認して案件ステータスを更新
    const { data: selected } = await supabase
      .from('job_selected_creators')
      .select('creator_id')
      .eq('job_id', jobId);

    const { data: job } = await supabase
      .from('jobs')
      .select('number_of_creators')
      .eq('id', jobId)
      .single();

    if (selected && job && selected.length >= job.number_of_creators) {
      await supabase
        .from('jobs')
        .update({ status: '募集終了' })
        .eq('id', jobId);
    } else {
      await supabase
        .from('jobs')
        .update({ status: '進行中' })
        .eq('id', jobId);
    }
  } catch (error) {
    console.error('Select creator error:', error);
    throw error;
  }
}

// 案件の支払いステータスを更新
export async function updateJobPaymentStatus(jobId: string, status: 'paid' | 'unpaid') {
  try {
    const { error } = await supabase
      .from('jobs')
      .update({ payment_status: status })
      .eq('id', jobId);

    if (error) throw error;
  } catch (error) {
    console.error('Update payment status error:', error);
    throw error;
  }
}

// ==================== スカウト関連 ====================

// スカウトオファーを送信
export async function sendScoutOffer(offerData: any) {
  try {
    const { data, error } = await supabase
      .from('scout_offers')
      .insert([{
        brand_id: offerData.brandId,
        brand_name: offerData.brandName,
        creator_id: offerData.creatorId,
        job_id: offerData.jobId,
        message: offerData.message,
        status: 'PENDING'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Send scout offer error:', error);
    throw error;
  }
}

// 全スカウトオファーを取得
export async function getAllScoutOffers() {
  try {
    const { data, error } = await supabase
      .from('scout_offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(offer => ({
      id: offer.id,
      brandId: offer.brand_id,
      brandName: offer.brand_name,
      creatorId: offer.creator_id,
      jobId: offer.job_id,
      message: offer.message,
      status: offer.status,
      createdAt: new Date(offer.created_at)
    }));
  } catch (error) {
    console.error('Get scout offers error:', error);
    throw error;
  }
}

// スカウトオファーに返信
export async function respondToScoutOffer(offerId: string, status: 'ACCEPTED' | 'DECLINED') {
  try {
    const { error } = await supabase
      .from('scout_offers')
      .update({ status })
      .eq('id', offerId);

    if (error) throw error;
  } catch (error) {
    console.error('Respond to scout offer error:', error);
    throw error;
  }
}

// ==================== チャット関連 ====================

// メッセージを送信
export async function sendMessage(messageData: any) {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        job_id: messageData.jobId,
        sender_id: messageData.senderId,
        sender_name: messageData.senderName,
        text: messageData.text
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
}

// 全チャットメッセージを取得
export async function getAllChatMessages() {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('timestamp', { ascending: true });

    if (error) throw error;
    
    return (data || []).map(msg => ({
      id: msg.id,
      jobId: msg.job_id,
      senderId: msg.sender_id,
      senderName: msg.sender_name,
      text: msg.text,
      timestamp: new Date(msg.timestamp)
    }));
  } catch (error) {
    console.error('Get chat messages error:', error);
    throw error;
  }
}

// ==================== 通知関連 ====================

// 通知を作成
export async function createNotification(userId: string, message: string) {
  try {
    const { error } = await supabase
      .from('inbox_notifications')
      .insert([{
        user_id: userId,
        message,
        is_read: false
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
}

// 全通知を取得
export async function getAllNotifications() {
  try {
    const { data, error } = await supabase
      .from('inbox_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(notif => ({
      id: notif.id,
      userId: notif.user_id,
      message: notif.message,
      isRead: notif.is_read,
      createdAt: new Date(notif.created_at)
    }));
  } catch (error) {
    console.error('Get notifications error:', error);
    throw error;
  }
}

// 通知を既読にする
export async function markNotificationsAsRead(userId: string) {
  try {
    const { error } = await supabase
      .from('inbox_notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Mark notifications as read error:', error);
    throw error;
  }
}