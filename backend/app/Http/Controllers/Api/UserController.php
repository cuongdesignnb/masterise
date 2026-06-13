<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    /**
     * Get list of users with filtering and pagination.
     */
    public function index(Request $request)
    {
        $query = User::query()->with('roles');

        // Filter by search query (name, email, phone)
        if ($request->has('q') && !empty($request->q)) {
            $search = $request->q;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && !empty($request->role)) {
            $query->role($request->role);
        }

        // Filter by status
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 15);
        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Map roles to user object for easy frontend consumption
        $items = collect($users->items())->map(function($user) {
            $user->role_names = $user->getRoleNames();
            return $user;
        });

        return response()->json([
            'success' => true,
            'data' => $items,
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ]
        ], 200);
    }

    /**
     * Store a newly created user/staff in database.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20|unique:users',
            'password' => ['required', Password::defaults()],
            'role' => 'required|string|exists:roles,name',
            'status' => 'required|string|in:active,inactive,suspended',
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
            'status' => $request->status,
        ]);

        // Assign Spatie Role
        $user->assignRole($request->role);

        // If role is customer, create customer profile
        if ($request->role === 'customer') {
            $user->customerProfile()->create([
                'phone' => $request->phone,
            ]);
        }

        $user->role_names = $user->getRoleNames();

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user
        ], 201);
    }

    /**
     * Display the specified user details.
     */
    public function show($id)
    {
        $user = User::with(['roles', 'customerProfile'])->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $user->role_names = $user->getRoleNames();

        return response()->json([
            'success' => true,
            'data' => $user
        ], 200);
    }

    /**
     * Update the specified user in database.
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'phone' => 'required|string|max:20|unique:users,phone,' . $id,
            'password' => ['nullable', Password::defaults()],
            'role' => 'required|string|exists:roles,name',
            'status' => 'required|string|in:active,inactive,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update fields
        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'status' => $request->status,
        ];

        // Hash password if provided
        if ($request->has('password') && !empty($request->password)) {
            $userData['password'] = Hash::make($request->password);
        }

        $user->update($userData);

        // Sync Spatie Roles
        $user->syncRoles([$request->role]);

        $user->role_names = $user->getRoleNames();

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user
        ], 200);
    }

    /**
     * Remove the specified user from database.
     */
    public function destroy(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Prevent self-deletion
        if ($request->user()->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account.'
            ], 400);
        }

        // Safety check: if user has associated leads or appointments, suspend instead of hard delete
        if ($user->leads()->count() > 0 || $user->appointments()->count() > 0) {
            $user->update(['status' => 'suspended']);
            return response()->json([
                'success' => true,
                'message' => 'User has active leads or appointments. Account has been suspended to preserve CRM history.'
            ], 200);
        }

        // Delete profile and user
        if ($user->customerProfile) {
            $user->customerProfile->delete();
        }
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ], 200);
    }
}
