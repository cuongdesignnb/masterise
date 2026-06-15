<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Register a new customer.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'status' => 'active',
        ]);

        // Assign customer and client roles (transitional compatibility)
        $user->assignRole(['customer', 'client']);

        // Create blank customer profile
        $user->customerProfile()->create([
            'phone' => $request->phone,
        ]);

        // Generate token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'data' => [
                'user' => $user->load('customerProfile'),
                'roles' => $user->getRoleNames(),
                'token' => $token,
            ]
        ], 201);
    }

    /**
     * Login user.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'login' => 'required|string', // can be email or phone
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Find user by email or phone
        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
        $user = User::where($loginField, $request->login)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid login credentials'
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Your account is suspended or inactive'
            ], 403);
        }

        // Generate token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $user->load('customerProfile'),
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
                'token' => $token,
            ]
        ], 200);
    }

    /**
     * Logout user (Revoke token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ], 200);
    }

    /**
     * Get current authenticated user details.
     */
    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user->load('customerProfile'),
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ]
        ], 200);
    }

    /**
     * Change user password.
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password does not match'
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully'
        ], 200);
    }

    /**
     * Update customer profile and preferences.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:users,phone,' . $user->id,
            'budget_min' => 'nullable|numeric',
            'budget_max' => 'nullable|numeric',
            'preferred_regions' => 'nullable|array',
            'preferred_types' => 'nullable|array',
            'preferred_status' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update User info
        $user->update([
            'name' => $request->name,
            'phone' => $request->phone,
        ]);

        // Update or Create Customer Profile info
        $user->customerProfile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'phone' => $request->phone,
                'budget_min' => $request->budget_min,
                'budget_max' => $request->budget_max,
                'preferred_regions' => $request->preferred_regions,
                'preferred_types' => $request->preferred_types,
                'preferred_status' => $request->preferred_status,
                'notes' => $request->notes,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user->load('customerProfile')
        ], 200);
    }

    /**
     * Get all sales agents.
     */
    public function salesAgents()
    {
        $agents = User::role(['sale', 'sale_manager'])->get(['id', 'name', 'phone', 'email']);

        return response()->json([
            'success' => true,
            'data' => $agents
        ], 200);
    }
}
