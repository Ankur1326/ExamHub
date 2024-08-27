interface FetchUserProfileParams {
  username: string;
  email: string;
}

export async function fetchUserProfile({ username, email }: FetchUserProfileParams) {
  try {
    const response = await fetch(`${process.env.API_URL}/api/profile/get?username=${username}&email=${email}`);

    // console.log("response : ", response);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user profile');
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch user profile');
  }
}

export async function updateUserProfile({formData, userId}: any) {
  try {
    console.log(formData, userId);
    
    const response = await fetch(`/api/profile/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formData,
        userId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user profile');
    }

    return await response.json();

  } catch (error) {
    console.error('Error updating profile:', error);
  }
}