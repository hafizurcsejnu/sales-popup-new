<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CountdownTimerController;
use App\Http\Controllers\StockCountdownController;
use App\Http\Controllers\DashBoardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/', function () {
    return "Hello API";
});

Route::post('/countdown-timers/save',[CountdownTimerController::class,'store'])->middleware('shopify.auth');
Route::post('/stock-countdown/save', [StockCountdownController::class, 'store'])->middleware('shopify.auth');
Route::get('/dashboard/list', [DashboardController::class, 'getAllData'])->middleware('shopify.auth');

Route::put('/countdown-timers/status/{id}', [CountdownTimerController::class, 'togglePublished'])->middleware('shopify.auth');
Route::put('/stock-countdown/status/{id}', [StockCountdownController::class, 'togglePublished'])->middleware('shopify.auth');

Route::delete('/countdown-timers/delete/{id}', [CountdownTimerController::class, 'destroy'])->middleware('shopify.auth');
Route::delete('/stock-countdown/delete/{id}', [StockCountdownController::class, 'destroy'])->middleware('shopify.auth');

// Countdown Timers Edit & Update
Route::get('/countdown-timers/edit/{id}', [CountdownTimerController::class, 'edit'])->middleware('shopify.auth');
Route::put('/countdown-timers/update/{id}', [CountdownTimerController::class, 'update'])->middleware('shopify.auth');

// Stock Countdown Edit & Update
Route::get('/stock-countdown/edit/{id}', [StockCountdownController::class, 'edit'])->middleware('shopify.auth');
Route::put('/stock-countdown/update/{id}', [StockCountdownController::class, 'update'])->middleware('shopify.auth');

Route::get('/countdown-timers/config/{id}', [CountdownTimerController::class, 'getConfig']);
Route::get('/stock-countdown/config/{id}', [StockCountdownController::class, 'getConfig']);