import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService, UserLoginForm, UserRegisterForm, UserResponseModel } from './user.service';
import { User } from '../../models/user-model/user.model';

describe('UserService', () => {
    let service: UserService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(UserService);
        httpMock = TestBed.inject(HttpTestingController);
        localStorage.clear();
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with no authenticated user', () => {
        expect(service.isAuthenticated()).toBeFalse();
        expect(service.user()).toBeNull();
        expect(service.token()).toBeNull();
    });

    it('should login user and save to localStorage', () => {
        const mockUser: User = {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User'
        };
        const mockToken = 'test-token-123';

        service.login(mockUser, mockToken);

        expect(service.isAuthenticated()).toBeTrue();
        expect(service.user()).toEqual(mockUser);
        expect(service.token()).toEqual(mockToken);

        const stored = localStorage.getItem('authState');
        expect(stored).toBeTruthy();
    });

    it('should logout user and clear localStorage', () => {
        const mockUser: User = {
            id: '1',
            username: 'testuser',
            email: 'test@example.com'
        };

        service.login(mockUser, 'token');
        service.logout();

        expect(service.isAuthenticated()).toBeFalse();
        expect(service.user()).toBeNull();
        expect(service.token()).toBeNull();
        expect(localStorage.getItem('authState')).toBeNull();
    });

    it('should update user information', () => {
        const mockUser: User = {
            id: '1',
            username: 'testuser',
            email: 'test@example.com'
        };

        service.login(mockUser, 'token');
        service.updateUser({ firstName: 'John', lastName: 'Doe' });

        const updatedUser = service.user();
        expect(updatedUser?.firstName).toBe('John');
        expect(updatedUser?.lastName).toBe('Doe');
    });

    it('should update token', () => {
        const mockUser: User = {
            id: '1',
            username: 'testuser',
            email: 'test@example.com'
        };

        service.login(mockUser, 'old-token');
        service.updateToken('new-token');

        expect(service.token()).toBe('new-token');
    });

    it('should get user full name', () => {
        const mockUser: User = {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe'
        };

        service.login(mockUser, 'token');
        expect(service.getFullName()).toBe('John Doe');
    });

    it('should return username when no first/last name', () => {
        const mockUser: User = {
            id: '1',
            username: 'testuser',
            email: 'test@example.com'
        };

        service.login(mockUser, 'token');
        expect(service.getFullName()).toBe('testuser');
    });

    it('should restore user from localStorage on init', () => {
        const mockUser: User = {
            id: '1',
            username: 'testuser',
            email: 'test@example.com'
        };
        const mockToken = 'stored-token';

        localStorage.setItem('authState', JSON.stringify({
            user: mockUser,
            isAuthenticated: true,
            token: mockToken
        }));

        // 創建新的服務實例來測試載入
        const newService = new UserService();

        expect(newService.isAuthenticated()).toBeTrue();
        expect(newService.user()).toEqual(mockUser);
        expect(newService.token()).toEqual(mockToken);
    });

    // API 方法測試
    describe('API Methods', () => {
        it('should login user via API', (done) => {
            const loginForm: UserLoginForm = {
                user_id: 'testuser',
                password: 'password123'
            };

            const mockResponse: UserResponseModel = {
                id: '1',
                user_id: 'testuser',
                username: 'Test User'
            };

            service.loginApi(loginForm).subscribe(response => {
                expect(response).toEqual(mockResponse);
                expect(service.isAuthenticated()).toBeTrue();
                expect(service.user()?.id).toBe('1');
                done();
            });

            const req = httpMock.expectOne('/api/users/login');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(loginForm);
            req.flush(mockResponse);
        });

        it('should register user via API', (done) => {
            const registerForm: UserRegisterForm = {
                user_id: 'newuser',
                username: 'New User',
                password: 'password123'
            };

            const mockResponse: UserResponseModel = {
                id: '2',
                user_id: 'newuser',
                username: 'New User'
            };

            service.registerApi(registerForm).subscribe(response => {
                expect(response).toEqual(mockResponse);
                expect(service.isAuthenticated()).toBeTrue();
                done();
            });

            const req = httpMock.expectOne('/api/users/register');
            expect(req.request.method).toBe('POST');
            req.flush(mockResponse);
        });

        it('should logout user via API', (done) => {
            // 先登入
            const mockUser: User = {
                id: '1',
                username: 'testuser',
                email: 'test@example.com'
            };
            service.login(mockUser, 'token');

            service.logoutApi().subscribe(() => {
                expect(service.isAuthenticated()).toBeFalse();
                expect(service.user()).toBeNull();
                done();
            });

            const req = httpMock.expectOne('/api/users/logout');
            expect(req.request.method).toBe('POST');
            req.flush({});
        });

        it('should refresh token via API', (done) => {
            service.refreshTokenApi().subscribe(() => {
                done();
            });

            const req = httpMock.expectOne('/api/users/refresh-token');
            expect(req.request.method).toBe('POST');
            req.flush({ message: 'Token refreshed successfully' });
        });
    });
});
